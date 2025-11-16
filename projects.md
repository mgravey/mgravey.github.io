---
title: Projects
layout: page
permalink: /projects/
bg_image: /assets/img/background/bocalDEtoile.jpg
---

{% include render_filters.html scope='projects' %}

<div id="projectList" class="card-list">
{% assign all = site.data.projects | sort: 'year_start' | reverse %}
{% for p in all %}
  {% assign tagstr = p.tags | join: ',' %}
  <div class="aProject" data-title="{{ p.title | escape }}" data-tags="{{ tagstr }}" data-rank="{{ p.rank | default: 9999 }}" data-yearstart="{{ p.year_start | default: p.years.start }}" data-yearfinish="{{ p.year_finish | default: p.years.finish }}">
    <div class="progress">
      <div class="progress-bar" style="width: {{ p.progress.code | default: 0 }}%"></div>
      <div class="progress-bar info" style="width: {{ p.progress.docs | default: 0 }}%"></div>
      <div class="progress-bar success" style="width: {{ p.progress.pub  | default: 0 }}%"></div>
    </div>
    <div class="padding-2 card-content">
      <div class="card-body">
        <a><h3 class="underline">{{ p.title }}</h3></a>
        {% if p.description %}<p class="justify padding-top-2 margin-bottom-1">{{ p.description }}</p>{% endif %}
        <div class="projectLink padding-top-0">
          {% if p.links.code %}<a target="_blank" href="{{ p.links.code }}" class='btn btn-outline-primary'><i class="fa-solid fa-code" aria-hidden="true"></i> Code</a>{% endif %}
          {% if p.links.docs %}
            {% if p.links.docs.first %}
              {% for d in p.links.docs %}
                {% capture lbl %}{{ d.label | downcase }}{% endcapture %}
                {% assign btn_class = 'btn btn-outline-info' %}
                {% assign fa_icon = 'fa-solid fa-book' %}
                {% if lbl contains 'online' or lbl contains 'website' or lbl contains 'app' %}
                  {% assign btn_class = 'btn btn-outline-danger' %}
                  {% assign fa_icon = 'fa-solid fa-globe' %}
                {% elsif lbl contains 'example' %}
                  {% assign btn_class = 'btn btn-outline-primary' %}
                  {% assign fa_icon = 'fa-solid fa-code' %}
                {% endif %}
                <a target="_blank" href="{{ d.url }}" class='{{ btn_class }}'><i class="{{ fa_icon }}" aria-hidden="true"></i> {{ d.label | default: 'Documentation' }}</a>
              {% endfor %}
            {% else %}
              <a target="_blank" href="{{ p.links.docs }}" class='btn btn-outline-info'><i class="fa-solid fa-book" aria-hidden="true"></i> Documentation</a>
            {% endif %}
          {% endif %}
          {% if p.links.pubs %}
            {% for m in p.links.pubs %}<a target="_blank" href="{{ m.url }}" class='btn btn-outline-success'><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> {{ m.label | default: 'Publication' }}</a>{% endfor %}
          {% elsif p.links.pub %}
            <a target="_blank" href="{{ p.links.pub }}" class='btn btn-outline-success'><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> Publication</a>
          {% endif %}
        </div>
        <div class="card-footer">
          <div class="badges">
            {% for t in p.tags %}
              {% assign def = site.data.taxonomy.tags | where: 'key', t | first %}
              <span class="badge tag-{{ t }}">{% if def and def.logo %}<img src="{{ def.logo | relative_url }}" alt="{{ def.label }}">{% endif %}{{ def.label | default: t }}</span>
            {% endfor %}
          </div>
        </div>
      </div>
      {% if p.image %}
      <div class="card-media"><img src="{{ p.image }}" alt="{{ p.title }}"></div>
      {% endif %}
    </div>
  </div>
{% endfor %}
</div>
