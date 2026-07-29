---
title: Publications
layout: page
permalink: /publications/
description: Peer-reviewed publications by Mathieu Gravey.
bg_image: /assets/generated/background/berezina.webp
page_class: readable justified
nav_order: 50
---

{% include render_filters.html scope='publications' %}


<div data-filter-list="publications">
{% if site.data.publications and site.data.publications.size > 0 %}
  {% assign pubs = site.data.publications %}
  {% assign years = pubs | map: 'year' | uniq | sort | reverse %}
  {% for y in years %}
  <div class="pub-year" data-year="{{ y }}">
    <h2>{{ y }}</h2>
    <ul>
      {% for p in pubs %}
        {% if p.year == y %}
        {% include publication_item.html publication=p %}
        {% endif %}
      {% endfor %}
    </ul>
  </div>
  {% endfor %}
{% else %}
  <p class="muted">No publications are currently available.</p>
{% endif %}
</div>
