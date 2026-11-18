# NovaSilicon

The Nova-Silicon team's bilingual company and research website.

Website: **https://nova-silicon.github.io/**

This is a static HTML/CSS/JavaScript website. It needs no build step, API key, database, or package installation to run.

## Preview

From the repository root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/. When working on a remote machine, forward port 8080 to your computer.

## Publish on GitHub Pages

1. Create the **public** repository `Nova-Silicon/nova-silicon.github.io`.
2. Upload these files into its root, with `index.html` directly at the top level. Upload the extracted files, not the ZIP archive or an enclosing directory.
3. In **Settings → Pages**, choose **Deploy from a branch**, **main**, **/(root)**, then **Save**.

The site will be available at https://nova-silicon.github.io/ after GitHub finishes its deployment. Later changes pushed to `main` publish automatically.

Official instructions: [Create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [configure the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Maintain

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, bilingual copy, research links |
| `showcase.js` | Homepage carousel images and their artifact captions |
| `styles.css` | Layout, colors, responsive styling |
| `main.js` | Language toggle, carousel, draggable detail viewer, navigation |
| `assets/` | Website images, font, and its license |
| `robots.txt`, `sitemap.xml` | Search indexing |

See [维护交接.md](维护交接.md) for the editing and handoff guide, and [ASSET_CREDITS.md](ASSET_CREDITS.md) for image attribution.

The font is distributed under the license in `assets/NotoSansSC-OFL.txt`. No blanket open-source license is granted to the company identity, research figures, or other website material by that font license.
