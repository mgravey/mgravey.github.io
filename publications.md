---
title: Publications
layout: page
permalink: /publications/
bg_image: /assets/img/background/berezina.jpg
---

Below is an auto-generated list from DOIs in `_data/dois.yml`, grouped by year. My name is highlighted in bold.

{% if site.data.publications and site.data.publications.size > 0 %}
  {% assign pubs = site.data.publications %}
  {% assign years = pubs | map: 'year' | uniq | sort | reverse %}
  {% for y in years %}
  <h2>{{ y }}</h2>
  <ul>
    {% for p in pubs %}
      {% if p.year == y %}
      <li>
        <span class="pub-authors">{{ p.authors_html }}</span> ({{ p.year }}). <strong>{{ p.title }}</strong>. <em>{{ p.venue }}</em>. <a href="https://doi.org/{{ p.doi }}">{{ p.doi }}</a>
      </li>
      {% endif %}
    {% endfor %}
  </ul>
  {% endfor %}
{% else %}
  <p class="muted">No publications loaded yet. Add DOIs in <code>_data/dois.yml</code>.</p>
{% endif %}
