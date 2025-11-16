---
title: Publications
layout: page
permalink: /publications/
bg_image: /assets/img/background/berezina.jpg
---

{% include render_filters.html scope='publications' %}

Below is an auto-generated list from DOIs in `_data/dois.yml`, grouped by year. My name is highlighted in bold. You can add optional `flags` and `rank` per DOI to support filtering and ordering.

{% if site.data.publications and site.data.publications.size > 0 %}
  {% assign pubs = site.data.publications %}
  {% assign years = pubs | map: 'year' | uniq | sort | reverse %}
  {% for y in years %}
  <div class="pub-year" data-year="{{ y }}">
    <h2>{{ y }}</h2>
    <ul>
      {% for p in pubs %}
        {% if p.year == y %}
        {% assign tagstr = p.flags | join: ',' %}
        <li class="aPub" data-tags="{{ tagstr }}" data-rank="{{ p.rank | default: 9999 }}">
          <span class="pub-authors">{{ p.authors_html }}</span> ({{ p.year }}). <strong>{{ p.title }}</strong>. <em>{{ p.venue }}</em>. <a href="https://doi.org/{{ p.doi }}">{{ p.doi }}</a>
        </li>
        {% endif %}
      {% endfor %}
    </ul>
  </div>
  {% endfor %}
{% else %}
  <p class="muted">No publications loaded yet. Add DOIs in <code>_data/dois.yml</code>.</p>
{% endif %}
