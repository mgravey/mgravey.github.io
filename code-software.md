---
title: Code & Software
layout: page
permalink: /code-software/
bg_image: /assets/img/background/code.jpg
---

{% include render_filters.html scope='code' %}

<div id="codeList" class="card-list">
{% assign all = site.data.code | sort: 'rank' %}
{% for c in all %}
  {% assign tagstr = c.tags | join: ',' %}
  <div class="aCode" data-title="{{ c.title | escape }}" data-tags="{{ tagstr }}" data-rank="{{ c.rank | default: 9999 }}">
    <div class="padding-2 card-content">
      <div class="card-body">
        <a><h3 class="underline">{{ c.title }}</h3></a>
        {% if c.description %}<p class="justify padding-top-2 margin-bottom-1">{{ c.description }}</p>{% endif %}
        <div class="projectLink padding-top-0">
          {% if c.links.code %}<a target="_blank" href="{{ c.links.code }}" class='btn btn-outline-primary'><i class="fa-solid fa-code" aria-hidden="true"></i> Code</a>{% endif %}
          {% if c.links.docs %}
            {% if c.links.docs.first %}
              {% for d in c.links.docs %}
                {% capture lbl %}{{ d.label | downcase }}{% endcapture %}
                {% assign btn_class = 'btn btn-outline-info' %}
                {% assign fa_icon = 'fa-solid fa-book' %}
                {% assign is_chrome = false %}
                {% if lbl contains 'chrome' %}
                  {% assign btn_class = 'btn btn-outline-danger' %}
                  {% assign is_chrome = true %}
                {% elsif lbl contains 'online' or lbl contains 'website' or lbl contains 'app' %}
                  {% assign btn_class = 'btn btn-outline-danger' %}
                  {% assign fa_icon = 'fa-solid fa-globe' %}
                {% elsif lbl contains 'example' %}
                  {% assign btn_class = 'btn btn-outline-primary' %}
                  {% assign fa_icon = 'fa-solid fa-code' %}
                {% endif %}
                <a target="_blank" href="{{ d.url }}" class='{{ btn_class }}'>
                  {% if is_chrome %}
                    <i class="fa-brands fa-chrome" aria-hidden="true"></i>
                  {% else %}
                    <i class="{{ fa_icon }}" aria-hidden="true"></i>
                  {% endif %}
                  {{ d.label | default: 'Documentation' }}</a>
              {% endfor %}
            {% else %}
              <a target="_blank" href="{{ c.links.docs }}" class='btn btn-outline-info'><i class="fa-solid fa-book" aria-hidden="true"></i> Documentation</a>
            {% endif %}
          {% endif %}
        </div>
        <div class="card-footer">
          <div class="badges">
            {% for t in c.tags %}
              {% assign def = site.data.taxonomy.tags | where: 'key', t | first %}
              <span class="badge tag-{{ t }}">{% if def and def.logo %}<img src="{{ def.logo | relative_url }}" alt="{{ def.label }}">{% endif %}{{ def.label | default: t }}</span>
            {% endfor %}
          </div>
        </div>
      </div>
      {% if c.image %}
      <div class="card-media"><img src="{{ c.image }}" alt="{{ c.title }}"></div>
      {% endif %}
    </div>
  </div>
{% endfor %}
</div>
