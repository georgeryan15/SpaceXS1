#!/usr/bin/env python3
"""
Extract plain text from HTML files (including SEC EDGAR submissions).

Uses BeautifulSoup to walk the DOM and collect visible text from elements
such as div, p, span, h1–h6, font, table cells, etc.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

# Tags whose contents are never user-visible prose
REMOVE_TAGS = frozenset({"script", "style", "noscript", "meta", "link", "head"})

# Block-level tags: insert a newline after their text for readability
BLOCK_TAGS = frozenset(
    {
        "address",
        "article",
        "aside",
        "blockquote",
        "br",
        "dd",
        "div",
        "dl",
        "dt",
        "fieldset",
        "figcaption",
        "figure",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "hr",
        "li",
        "main",
        "nav",
        "ol",
        "p",
        "pre",
        "section",
        "table",
        "td",
        "th",
        "tr",
        "ul",
    }
)

TEXT_BLOCK_RE = re.compile(r"<TEXT>(.*?)</TEXT>", re.DOTALL | re.IGNORECASE)
HIDDEN_STYLE_RE = re.compile(r"display\s*:\s*none", re.IGNORECASE)
MULTI_NEWLINE_RE = re.compile(r"\n{3,}")
MULTI_SPACE_RE = re.compile(r"[ \t]{2,}")


def extract_sec_text_blocks(raw: str) -> list[str]:
    """Pull HTML/plain content from SEC <TEXT>...</TEXT> sections."""
    return TEXT_BLOCK_RE.findall(raw)


def is_hidden(tag: Tag) -> bool:
    attrs = tag.attrs
    if not attrs:
        return False
    style = attrs.get("style")
    if style and HIDDEN_STYLE_RE.search(style):
        return True
    if attrs.get("hidden") is not None:
        return True
    return False


def remove_non_visible(soup: BeautifulSoup) -> None:
    for name in REMOVE_TAGS:
        for tag in soup.find_all(name):
            tag.decompose()

    for tag in soup.find_all(True):
        if not isinstance(tag, Tag) or tag.attrs is None:
            continue
        if is_hidden(tag):
            tag.decompose()


def element_to_text(element: Tag | NavigableString, *, block_separator: str = "\n") -> str:
    """Recursively collect text, honoring block boundaries."""
    if isinstance(element, NavigableString):
        return str(element)

    if not isinstance(element, Tag):
        return ""

    parts: list[str] = []
    for child in element.children:
        if isinstance(child, NavigableString):
            text = str(child)
            if text:
                parts.append(text)
        elif isinstance(child, Tag):
            parts.append(element_to_text(child, block_separator=block_separator))

    joined = "".join(parts)
    if not joined.strip():
        return ""

    if element.name in BLOCK_TAGS:
        return joined.strip() + block_separator

    return joined


def html_to_text(html: str, *, parser: str = "lxml") -> str:
    soup = BeautifulSoup(html, parser)
    remove_non_visible(soup)

    # Prefer body when present so we skip any leftover wrapper noise
    root = soup.body if soup.body else soup
    raw = element_to_text(root)
    return normalize_text(raw)


def normalize_text(text: str) -> str:
    lines = []
    for line in text.splitlines():
        line = MULTI_SPACE_RE.sub(" ", line.strip())
        if line:
            lines.append(line)
    text = "\n".join(lines)
    return MULTI_NEWLINE_RE.sub("\n\n", text).strip() + "\n"


def sec_header_to_text(raw: str) -> str:
    """Convert the SEC-HEADER block (before first <DOCUMENT>) to plain lines."""
    header_match = re.search(
        r"<SEC-HEADER>(.*?)</SEC-HEADER>", raw, re.DOTALL | re.IGNORECASE
    )
    if not header_match:
        return ""

    block = header_match.group(1)
    lines: list[str] = []
    for line in block.splitlines():
        line = line.strip()
        if line:
            lines.append(line)
    return "\n".join(lines) + "\n\n" if lines else ""


def file_to_text(
    path: Path,
    *,
    parser: str = "lxml",
    include_sec_header: bool = False,
    sec_text_only: bool = True,
) -> str:
    raw = path.read_text(encoding="utf-8", errors="replace")

    chunks: list[str] = []

    if include_sec_header:
        chunks.append(sec_header_to_text(raw))

    if sec_text_only and "<TEXT>" in raw.upper():
        blocks = extract_sec_text_blocks(raw)
        if blocks:
            for i, block in enumerate(blocks):
                block = block.strip()
                if not block:
                    continue
                chunks.append(html_to_text(block, parser=parser))
            return "".join(chunks)

    return html_to_text(raw, parser=parser)


def main() -> int:
    default_input = Path(__file__).resolve().parent / "rawfile.html"
    default_output = default_input.with_suffix(".txt")

    parser = argparse.ArgumentParser(
        description="Strip HTML and extract plain text using BeautifulSoup."
    )
    parser.add_argument(
        "input",
        nargs="?",
        type=Path,
        default=default_input,
        help=f"Input HTML file (default: {default_input.name})",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Output text file (default: input path with .txt extension)",
    )
    parser.add_argument(
        "--parser",
        choices=("lxml", "html.parser"),
        default="lxml",
        help="BeautifulSoup backend (lxml is faster on large files)",
    )
    parser.add_argument(
        "--include-sec-header",
        action="store_true",
        help="Include SEC-HEADER metadata at the top of the output",
    )
    parser.add_argument(
        "--whole-file",
        action="store_true",
        help="Parse the entire file as HTML instead of only SEC <TEXT> blocks",
    )

    args = parser.parse_args()
    input_path: Path = args.input.resolve()
    output_path: Path = (
        args.output.resolve()
        if args.output
        else input_path.with_suffix(".txt")
    )

    if not input_path.is_file():
        print(f"error: input file not found: {input_path}", file=sys.stderr)
        return 1

    try:
        text = file_to_text(
            input_path,
            parser=args.parser,
            include_sec_header=args.include_sec_header,
            sec_text_only=not args.whole_file,
        )
    except Exception as exc:
        print(f"error: failed to parse {input_path}: {exc}", file=sys.stderr)
        return 1

    output_path.write_text(text, encoding="utf-8")
    print(f"Wrote {len(text):,} characters to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
