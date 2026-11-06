"""Lokalna kontrola publikacji: reguły techniczne strażnika SEO TRC."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.text = []
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
    def handle_data(self, data):
        self.text.append(data)

def check(path):
    source = path.read_text(encoding='utf-8')
    page = Page()
    page.feed(source)
    errors = []
    def require(ok, message):
        if not ok:
            errors.append(message)
    def tags(name):
        return [attrs for tag, attrs in page.tags if tag == name]
    title = re.findall(r'<title>(.*?)</title>', source, re.S)
    require(len(title) == 1 and 25 <= len(title[0]) <= 60, 'Tytuł: 25–60 znaków')
    meta = {a.get('name', a.get('property')): a.get('content', '') for a in tags('meta')}
    require(70 <= len(meta.get('description', '')) <= 155, 'Opis: 70–155 znaków')
    require('viewport' in meta, 'Brak viewport')
    require('noindex' not in meta.get('robots', '').lower(), 'noindex')
    require(meta.get('og:title') == title[0], 'Niespójny og:title')
    require(meta.get('og:image', '').startswith('https://'), 'Brak obrazu OG')
    canon = [a.get('href', '') for a in tags('link') if a.get('rel') == 'canonical']
    require(len(canon) == 1 and canon[0].startswith('https://') and '#' not in canon[0], 'Canonical')
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', source, re.S)
    require(len(h1) == 1 and len(h1[0]) <= 90, 'H1')
    require(len(tags('h2')) >= 2, 'Za mało H2')
    headings = [int(t[1]) for t, _ in page.tags if re.fullmatch('h[1-6]', t)]
    require(all(b <= a + 1 for a, b in zip(headings, headings[1:])), 'Skok nagłówków')
    require(tags('html')[0].get('lang') == 'pl', 'Język HTML')
    for image in tags('img'):
        require(0 < len(image.get('alt', '')) <= 125, 'Alt obrazu')
        require('width' in image and 'height' in image, 'Wymiary obrazu')
        require(Path('public' + image.get('src', '')).exists(), 'Brak pliku obrazu')
    links = [a.get('href', '') for a in tags('a')]
    require(sum(x.startswith('/blog/') for x in links) >= 3, 'Trzy linki do artykułów')
    for link in links:
        require(bool(link) and not link.startswith('javascript:'), 'Nieprawidłowy odnośnik')
        if link.startswith('/blog/'):
            require(Path('public' + link).exists(), 'Brak celu: ' + link)
    data = [json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S)]
    articles = [x for x in data if x.get('@type') == 'Article']
    require(len(articles) == 1, 'Article JSON-LD')
    for article in articles:
        require(all(article.get(k) for k in ['headline', 'author', 'datePublished', 'image', 'inLanguage']), 'Pola Article')
    article_text = re.search(r'<article>(.*?)</article>', source, re.S).group(1)
    require(len(re.sub('<[^>]+>', ' ', article_text).split()) >= 300, 'Objętość artykułu')
    require('Stan prawny:' in source and 'Dz.U.' in source and 'Redakcja emigrante.pl' in source, 'Autor, stan prawny, źródła')
    require(canon[0] in Path('public/sitemap.xml').read_text(encoding='utf-8'), 'Brak w sitemap')
    print(str(path) + ': ' + ('BŁĘDY: ' + '; '.join(errors) if errors else 'OK — kontrola automatyczna'))
    return bool(errors)

if __name__ == '__main__':
    sys.exit(any(check(Path(p)) for p in sys.argv[1:]))
