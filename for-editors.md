---
title: For Editors
layout: page
permalink: /for-editors/
description: Review-invitation guidance for journal editors.
bg_image: /assets/generated/background/review.webp
page_class: readable justified
---

## Dear Editors Looking For Reviewers

I know it is increasingly hard to find reviewers. If you do not waste my time, I will try not to waste yours.

I work at the intersection of geostatistics, remote sensing, and machine learning for geoscience, with strong emphasis on reproducible scientific software.

Before inviting me, check relevance, and do not hesitate to use an LLM if it can help.  
Example prompt: "Given this abstract and Mathieu Gravey's background, is he a relevant reviewer? Answer yes/no with 3 reasons."

## Contact Addresses (Unlocked After Quick Questions)

Review invitations:
<a class="btn btn-publication email-gate-trigger" href="{{ '/contact/' | relative_url }}" data-review-email title="Unlock review email">Unlock review email</a>

For non-review messages, use the regular contact page:  
[Contact]({{ '/contact/' | relative_url }})

## Rules For Review Invitations

1. **Review invitations sent to any other inbox are rejected.**

2. **Direct decline link is mandatory.**  
If I decide to decline and your email has no direct decline link (no account creation, no authentication, one-click decline with optional short justification), I will ignore the invitation and let the deadline expire. If your system already has an account with my first/family name, merge duplicates before inviting me. People change institutions, so email addresses also change over time, and I will not test all historical institutional emails to recover access.  
{% assign orcid_profile = site.data.person.social | where: 'key', 'orcid' | first %}
If supported, use [ORCID]({{ orcid_profile.url }}) as the login.

3. **Minimum review window: 4 weeks.**  
If your standard deadline is shorter than 4 weeks, you are likely wasting time. I am often busy and I prefer to think carefully about reviews, so I will probably reject.

4. **State manuscript length up front.**  
Please include page count (or equivalent word count), especially for long submissions. I do not reject long papers by default, but I decide based on current bandwidth. If this is intentionally hidden, I will reject and blacklist the journal from future reviews.
