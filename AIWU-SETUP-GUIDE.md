# AIWU (AI Writer Starter Unlimited) Setup Guide

## Prerequisites
- WordPress installed on each domain
- OpenAI API key (https://platform.openai.com/api-keys)
- ~$30-50/month budget for API calls

## Step 1: Install AIWU Plugin

1. WordPress Dashboard → Plugins → Add New
2. Search "AIWU" or "AI Writer Starter"
3. Install & Activate
4. Or download from: https://wordpress.org/plugins/flavor-flavor/

## Step 2: OpenAI API Setup

1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key (starts with `sk-`)
4. Add billing: https://platform.openai.com/account/billing

### Recommended API Settings:
```
Model: gpt-4o-mini (cheapest, good quality)
Temperature: 0.7
Max tokens: 4000
```

### Cost Estimate:
- GPT-4o-mini: ~$0.15/1M input, ~$0.60/1M output
- Per article (1500 words): ~$0.01-0.02
- 200 articles: ~$3-4

## Step 3: Configure AIWU

### General Settings:
```
API Key: [Your OpenAI Key]
Default Model: gpt-4o-mini
Default Word Count: 1500
Auto Publish: Yes (or Schedule)
Post Status: Draft (for review) or Publish (for auto)
```

### Article Settings per Domain:

#### vietnamvisaurgent.com
```
Category: Urgent Visa
Tags: urgent, express, fast, emergency
Author: Admin
Featured Image: Auto-generate or stock
```

#### vietnam-visa-fast.com
```
Category: Visa Guides
Tags: visa, requirements, application, evisa
Author: Admin
Featured Image: Auto-generate or stock
```

#### vietnamtravel.help
```
Category: Travel Guides
Tags: travel, tourism, destinations, tips
Author: Admin
Featured Image: Auto-generate or stock
```

#### vietnamvisaurgent.in
```
Category: India Visa
Tags: indian, india, delhi, mumbai, visa
Author: Admin
Featured Image: Auto-generate or stock
```

#### 越签.com
```
Category: 签证指南
Tags: 越南签证, 电子签证, 落地签, 加急
Author: Admin
Featured Image: Auto-generate or stock
```

## Step 4: Import Keywords

### CSV Import Format:
```csv
keyword,word_count,category,tags
vietnam visa urgent,1500,Urgent Visa,"urgent,express,fast"
```

### Import Steps:
1. AIWU → Bulk Generate
2. Upload CSV file
3. Set template/prompt
4. Start generation

## Step 5: Custom Prompt Template

```
Write a comprehensive, SEO-optimized article about "{keyword}".

Requirements:
- Word count: {word_count} words
- Include H2 and H3 headings
- Add a FAQ section with 4-5 questions
- Write in {language}
- Target audience: People looking for Vietnam visa information
- Include practical, actionable advice
- Use current year (2025) for any date references
- End with a clear call-to-action

Structure:
1. Introduction (hook + overview)
2. Main content (detailed information)
3. Step-by-step process (if applicable)
4. Tips and recommendations
5. FAQ section
6. Conclusion with CTA

Do not:
- Use generic filler content
- Mention competitors
- Include external links
- Use placeholder text like [INSERT]
```

## Step 6: Scheduling

### Recommended Schedule:
```
Articles per day: 10-15 per domain
Best posting times:
- 6:00 AM (morning readers)
- 12:00 PM (lunch break)
- 6:00 PM (evening)
- 9:00 PM (night research)

Spread throughout day for natural posting pattern
```

### AIWU Scheduler Settings:
```
Posts per day: 10
Random interval: 1-3 hours
Days: Monday-Sunday
Start time: 06:00
End time: 22:00
```

## Step 7: Quality Control

### Auto-Review Checklist:
1. [ ] Title includes keyword
2. [ ] Meta description set
3. [ ] Featured image added
4. [ ] Internal links working
5. [ ] No placeholder text
6. [ ] Correct category/tags

### Weekly Tasks:
- Review 10% of published articles
- Check Google Search Console for indexing
- Update any outdated information
- Add internal links between articles

## Step 8: SEO Optimization

### Install Additional Plugins:
```
- Yoast SEO or RankMath (SEO)
- WP Rocket (Speed)
- ShortPixel (Image optimization)
- Schema Pro (Rich snippets)
```

### Yoast/RankMath Settings:
```
Focus keyword: From CSV
Meta title: {keyword} | {sitename}
Meta description: Auto from first paragraph
```

## Troubleshooting

### Common Issues:

**API Error 429 (Rate Limit)**
- Reduce articles per minute
- Add delays between generations
- Upgrade OpenAI plan

**Content Too Short**
- Increase word count setting
- Adjust prompt to be more detailed
- Use GPT-4 instead of mini

**Duplicate Content**
- Check CSV for duplicate keywords
- Add unique angles in prompt
- Vary secondary keywords

## Monitoring & Analytics

### Google Search Console:
1. Add all domains
2. Submit sitemaps
3. Monitor indexing
4. Check for errors

### Google Analytics 4:
1. Create GA4 property per domain
2. Add tracking code
3. Set up goals (apply button clicks)

## Expected Results

### Week 1-2:
- ~100-200 articles published
- Initial indexing starts
- No significant traffic yet

### Week 3-4:
- ~300-400 articles total
- Long-tail keywords start ranking
- 50-200 daily visitors

### Month 2-3:
- ~500+ articles
- Competitive keywords improving
- 500-2000 daily visitors

### Month 4-6:
- Authority building
- Top 10 for target keywords
- 2000-10000 daily visitors

## Budget Summary

| Item | Monthly Cost |
|------|-------------|
| OpenAI API | $30-50 |
| Namecheap Hosting | $10 |
| Domain renewals | ~$5 |
| **Total** | **~$45-65/month** |

---

Ready to start? Import your first CSV and begin generating!
