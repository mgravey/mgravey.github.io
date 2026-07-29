---
title: Experience & Skills
layout: page
permalink: /experience-skills/
description: Academic experience, education, awards, and technical skills of Mathieu Gravey.
bg_image: /assets/generated/background/experience.webp
page_class: readable
nav_order: 60
nav_label: Experience
---

## Experience

<div class="table-scroll" role="region" aria-label="Professional experience" tabindex="0">
  <table class="experience-table">
    <caption class="sr-only">Professional experience</caption>
    <thead>
      <tr>
        <th scope="col"><span class="sr-only">Year symbol</span></th>
        <th scope="col">Date</th>
        <th scope="col">Role</th>
        <th scope="col">Details</th>
      </tr>
    </thead>
    <tbody>
      {% for item in site.data.cv.experience %}
      <tr>
        <td class="year-symbol">{% include cistercian.html year=item.start %}</td>
        <td class="table-date">{{ item.display_date }}</td>
        <td>
          <strong>{{ item.role }}</strong><br>
          {% if item.url %}<a href="{{ item.url }}">{{ item.institution }}</a>{% else %}{{ item.institution }}{% endif %}
          {% if item.location %}<br><span class="muted">{{ item.location }}</span>{% endif %}
        </td>
        <td>{{ item.details }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>

## Education

<div class="table-scroll" role="region" aria-label="Education" tabindex="0">
  <table class="experience-table education-table">
    <caption class="sr-only">Education</caption>
    <thead>
      <tr>
        <th scope="col"><span class="sr-only">Year symbol</span></th>
        <th scope="col">Date</th>
        <th scope="col">Degree</th>
        <th scope="col">Details</th>
      </tr>
    </thead>
    <tbody>
      {% for item in site.data.cv.education %}
      <tr>
        <td class="year-symbol">{% include cistercian.html year=item.start %}</td>
        <td class="table-date">{{ item.display_date }}</td>
        <td>
          <strong>{{ item.degree }}</strong><br>
          {% if item.url %}<a href="{{ item.url }}">{{ item.institution }}</a>{% else %}{{ item.institution }}{% endif %}
        </td>
        <td>{{ item.details }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>

## Prizes and Awards

<div class="compact-grid">
{% for item in site.data.cv.awards %}
  <article class="compact-card">
    <p class="eyebrow">{{ item.year }} · {{ item.organization }}</p>
    <h3>{{ item.title }}</h3>
  </article>
{% endfor %}
</div>

## Skills

<div class="skills-grid">
  <section>
    <h3>Programming</h3>
    <dl class="skill-list">
      {% for item in site.data.cv.skills.programming %}
        <div><dt>{{ item.name }}</dt><dd>{{ item.level }}</dd></div>
      {% endfor %}
    </dl>
  </section>
  <section>
    <h3>Interfacing</h3>
    <ul>{% for item in site.data.cv.skills.interfacing %}<li>{{ item }}</li>{% endfor %}</ul>
    <h3>Software</h3>
    <ul class="inline-list">{% for item in site.data.cv.skills.software %}<li>{{ item }}</li>{% endfor %}</ul>
    <h3>Languages</h3>
    <dl class="skill-list">
      {% for item in site.data.cv.skills.languages %}
        <div><dt>{{ item.name }}</dt><dd>{{ item.level }}</dd></div>
      {% endfor %}
    </dl>
  </section>
</div>
