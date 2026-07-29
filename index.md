---
title: About Me
layout: page
permalink: /
description: Mathieu Gravey is a researcher working across geoscience, remote sensing, geostatistics, and scientific computing.
bg_image: /assets/generated/background/starSky.webp
page_class: readable justified
nav_order: 10
nav_label: About
---

{% assign current_role = site.data.cv.experience | where: 'id', site.data.person.current_experience_id | first %}
{% assign phd = site.data.cv.education | where: 'id', site.data.person.featured_education_id | first %}

<section class="intro">
  <div class="intro-layout">
    <div class="intro-text">
      <p class="eyebrow">{{ site.data.person.headline }}</p>
      <p class="intro-copy">
        I am a {{ current_role.role }} at
        <a href="{{ current_role.url }}">{{ current_role.institution }}</a> in {{ current_role.location }}.
        My {{ phd.degree }} from <a href="{{ phd.url }}">{{ phd.institution }}</a> focused on geostatistics,
        which remains a core pillar of my work.
      </p>
      <p>
        Previously,
        {% for role_id in site.data.person.featured_experience_ids %}
          {% assign previous_role = site.data.cv.experience | where: 'id', role_id | first %}
          I was {{ previous_role.role }} at
          {% if previous_role.url %}<a href="{{ previous_role.url }}">{{ previous_role.institution }}</a>{% else %}{{ previous_role.institution }}{% endif %}{% unless forloop.last %}; {% endunless %}
        {% endfor %}.
      </p>
      <div class="hero-actions">
        <a class="btn btn-code" href="{{ '/research/' | relative_url }}">Explore my research</a>
        <a class="btn btn-documentation" href="{{ '/publications/' | relative_url }}">View publications</a>
      </div>
    </div>
    <img class="about-photo popupTrigger" src="{{ site.data.person.portrait | relative_url }}" alt="{{ site.data.person.portrait_alt }}" width="641" height="900" data-popup-id="old_picture">
  </div>
</section>

## Focus Areas

<div class="focus-grid">
{% for area in site.data.person.focus_areas %}
  <section class="focus-card">
    <h3>{{ area.title }}</h3>
    <ul>{% for item in area.items %}<li>{{ item }}</li>{% endfor %}</ul>
  </section>
{% endfor %}
</div>

## Current Work
{{ site.data.person.current_work }}

I also publish short opinion notes in <a href="https://www.mgravey.com/viewpoints/" data-barba-prevent="all">Viewpoints</a>.

If you’re a student, see [Advice](/advices/) and [For Students](/4students/).

<!-- Old photo popup -->
<div class="popup" data-popup-id="old_picture" aria-label="Older portrait">
  <div class="popup-inner">
    <img src="{{ site.data.person.previous_portrait | relative_url }}" alt="Older portrait of Mathieu Gravey" width="899" height="900">
    <p class="largest italic" style="text-align:center; margin-top:12px;">I always keep an older picture, to fit with other researchers!</p>
  </div>
  <button class="popup-close" type="button" aria-label="Close"></button>
</div>
