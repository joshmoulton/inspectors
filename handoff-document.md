# Project Handoff Document
## Mortgage Field Inspection Management SaaS — Claude Code Reference

---

## 1. What We're Building

A modern, self-serve SaaS platform that replaces **InspectorADE** as the go-to order management system for **mortgage field inspection companies**. These are businesses that manage networks of independent contractors who physically visit and photograph properties with delinquent or defaulted mortgages on behalf of banks and servicers.

The target customer is a **mid-size field inspection company** that:
- Has dozens to hundreds of subcontractor inspectors
- Receives work orders from large "national" companies (ServiceLink, Safeguard, MCS, etc.)
- Needs to dispatch those orders to their contractors, track completion, and submit results back
- Currently pays InspectorADE **$0.35 per completed order** with no monthly fee

**Founding customer already secured:** A friend of the founder who currently pays InspectorADE ~$4,000/month (≈11,400 orders/month). His data has already been imported into the MVP.

---

## 2. Market Context

### The Industry
- Mortgage field inspection companies sit between large "national" servicers and on-the-ground contractors
- When a mortgage goes delinquent, the bank dispatches occupancy checks, condition reports, etc.
- Each property may be inspected monthly, bi-weekly, or more — creating recurring, high-volume order flow
- Estimated **~5 million inspections/month** in the US (conservative center estimate)
- Volume spikes during recessions/foreclosure waves — recession-resistant business

### The Customer's Workflow
1. National company sends a batch of work orders (CSV, XML, or portal export)
2. Field inspection company imports orders into their software
3. Orders are assigned to contractors by zip code
4. Contractors complete the inspection via mobile app (photos, form fields, GPS)
5. Company QCs the work, then submits results back to the national
6. Company pays contractors, gets paid by national
7. Software platform charges per completed order

### Types of Inspections
- Occupancy checks (drive-by, ~10 min, lowest pay)
- Interior inspections
- Property condition reports
- Vacant property inspections
- REO / foreclosure inspections
- FHA conveyance inspections

---

## 3. Competitive Landscape

### InspectorADE (Primary Target to Displace)
- **Founded:** 2010, by Kenneth Lafond, company: Double Door Enterprises
- **Pricing:** $0.35/completed order, billed monthly, no monthly minimum, unlimited users
- **Billing:** Invoice sent beginning of month for prior month completions
- **Integrations:** 20+ nationals including ServiceLink, Safeguard, MCS, Five Brothers, Altisource, Cyprexx, etc.
- **Product:** Web app + iPhone/Android app + desktop app ("InspectorADE Junior") for offline
- **Key features:** Auto data entry, custom forms per national, side-by-side photo comparison, zip-code auto-assignment, form prepopulation from prior month
- **Weaknesses:** No self-serve signup (requires phone call), no public pricing, website looks circa 2008, no analytics, dated UI, lifestyle business with no growth investment

### EZ Inspections (Main Competitor)
- **Volume:** 12 million work orders/year (1M/month) — much larger than InspectorADE
- **Pricing:** As low as **$0.15/order** (publicly listed) — less than half of InspectorADE
- **Industries:** Mortgage inspection, property preservation, BPO/REO, insurance, vacation rental, multi-family
- **Features:** Auto order download/upload, auto dispatch by zip, mobile data collection, QC features, routing/mapping, QuickBooks integration
- **Weakness:** Also very dated UI, partially self-serve but clunky

### Pruvan (Now owned by Verisk)
- **Focus:** Proof-of-work / tamper-proof photos — slightly different angle than full order management
- **Pricing:** Flat monthly SaaS — $39/mo Solo, $156/mo Team, $325/mo Business
- **Backed by:** Verisk (massive insurance/data company) — corporate bloat, less nimble
- **Weakness:** More expensive for high-volume companies; not built specifically for mortgage field inspection workflow

### Property Pres Wizard / Aspen Grove
- Enterprise-tier — banks and servicers, not the target market for this product

### Positioning Summary
| | InspectorADE | EZ Inspections | Pruvan | **Our App** |
|---|---|---|---|---|
| Pricing | $0.35/order | $0.15/order | $39–$325/mo flat | TBD (see below) |
| Self-serve signup | ❌ | Partial | ✅ | ✅ |
| Modern UI | ❌ | ❌ | Moderate | ✅ |
| Mobile app | ✅ | ✅ | ✅ | ✅ |
| Mortgage-specific | ✅ | ✅ | Partial | ✅ |

---

## 4. Pricing Strategy (Recommended)

### Launch Pricing
**$0.25/completed order** — no monthly fee, no setup fee, no user fee, unlimited contractors

- 29% cheaper than InspectorADE ($0.35)
- More expensive than EZ ($0.15) — justified by better UX, modern mobile app, self-serve
- Easy pitch: "Same thing you have now, better app, 29% cheaper"

### Billing Model (Mirror InspectorADE's)
- Count completed orders per month
- Invoice on 1st of month for prior month
- Support ACH + card (ACH preferred for large invoices — saves 2.9% Stripe fee)
- Do NOT charge for canceled orders

### Future: Volume Tiers
Once established, introduce tiered pricing to lock in large accounts:
- 0–1,000/mo: $0.25/order
- 1,001–5,000/mo: $0.22/order
- 5,001+/mo: $0.18/order

---

## 5. What the "Integrations" Actually Are

The nationals listed on InspectorADE's site are NOT formal API partnerships. They are:

1. **Custom CSV/XML parsers** — each national sends work orders in their own column format. The software parses the file on import.
2. **Custom output formatters** — when submitting results, each national has their own required format or portal. The software exports in the correct format.
3. **Custom forms** — each national asks different questions on their inspection forms. The software shows the right form for the right national.
4. **In some cases: portal automation** — automated submission into vendor web portals.

No API keys or business agreements are required. The formats can be reverse-engineered by working with real inspectors who use those portals. The founding customer is the best resource for this.

### Integration Priority Order
Build integrations for the nationals the founding customer actually uses first. Ask him which nationals he works with — that is the roadmap.

---

## 6. Core Feature Requirements

### Admin Dashboard (Company Owner / Office Staff)
- [ ] Import work orders (CSV/XML upload per national format)
- [ ] View all open, in-progress, and completed orders
- [ ] Assign orders to contractors (manual + auto-assign by zip code)
- [ ] Control the due date contractors see (may differ from actual client due date)
- [ ] QC review — approve/reject contractor submissions before sending to national
- [ ] Export/submit completed inspections back to national in correct format
- [ ] Contractor management (add/remove, set pay rates, view performance)
- [ ] Multi-client view (see all nationals on one screen)
- [ ] Reporting: zip code volume, profit/loss, contractor payments
- [ ] Billing dashboard (view monthly usage, pay invoice)

### Contractor Mobile App (The Inspector in the Field)
- [ ] See assigned orders (only show orders within active due date window)
- [ ] Accept/decline orders
- [ ] Navigate to property (GPS/maps integration)
- [ ] Complete inspection form (fields match what the national requires)
- [ ] Photo capture with automatic GPS tagging, date/time stamp, EXIF validation
- [ ] Submit completed inspection
- [ ] Work offline and sync when connection restored
- [ ] View earnings/payment history

### Billing Engine
- [ ] Count completed orders per company per month (only completed, not canceled)
- [ ] Generate invoice on 1st of month
- [ ] Stripe integration with usage-based metering
- [ ] Support ACH and card
- [ ] Payment made through the platform

### Key "Nice to Have" Features (Phase 2)
- [ ] Side-by-side photo comparison month-over-month
- [ ] Route optimization for contractors
- [ ] Contractor payment tracking (what you owe subs)
- [ ] QuickBooks integration
- [ ] Photo labeling / organization
- [ ] Analytics dashboard (trends, performance scores)

---

## 7. Technical Stack (Current / Recommended)

Based on the founder's existing tools:

| Layer | Tool |
|---|---|
| Frontend/Admin | Lovable or Next.js |
| Mobile App | React Native (single codebase, iOS + Android) |
| Backend/Database | Supabase (auth, DB, file storage for photos) |
| File Parsing | Edge functions / serverless for order import |
| Billing | Stripe (usage-based metering) |
| Hosting | Vercel |

### Key Technical Considerations
- **Photo storage:** Inspections generate large volumes of photos. Use Supabase Storage with CDN. Consider compression pipelines.
- **EXIF validation:** Must validate photo metadata (date taken, GPS coordinates) — nationals require proof photos are taken at the property on the correct date. This is a trust/compliance feature.
- **Offline mobile:** Contractors often work in areas with poor connectivity. The mobile app must queue submissions and sync when online.
- **Multi-tenant:** Each company account is isolated. Contractors only see their own orders.
- **Order state machine:** Orders move through states: Imported → Assigned → In Progress → Submitted → QC Review → Approved → Delivered. Build this carefully.

---

## 8. Go-To-Market Plan

### Phase 1 — Founding Customer
1. Lock in the founding customer (currently paying InspectorADE ~$4K/month)
2. He saves ~$1,142/month switching to $0.25/order
3. Get him live and stable — his usage validates the product
4. Ask him for 2–3 warm referrals to peers in the industry

### Phase 2 — Industry Network
- Property preservation / mortgage field services is a **tight-knit, word-of-mouth industry**
- Key watering holes: NAMFS (National Association of Mortgage Field Services) — annual conference in May, forums like PreservationTalk
- Consider joining NAMFS as a technology member — InspectorADE, EZ Inspections, Pruvan are all listed there

### Phase 3 — Self-Serve Growth
- Transparent public pricing (huge differentiator vs InspectorADE)
- Self-serve signup with no sales call required
- Free migration assistance — offer to set up integrations for new customers

---

## 9. Business Setup Checklist

Before charging real money:
- [ ] Form a separate LLC for this product (do not run under existing business)
- [ ] Terms of Service and Privacy Policy (you handle property data and photos)
- [ ] Master Service Agreement template for B2B customers
- [ ] Stripe account with usage-based billing configured
- [ ] ACH payment support enabled in Stripe
- [ ] Define SLA (recommend: inspections processed and submitted within 24 hours, target 12)

---

## 10. MVP Status (As of Conversation)

- ✅ MVP built
- ✅ Founding customer's data imported
- 🔲 Billing/Stripe integration — not yet built
- 🔲 Additional feature functionality in progress
- 🔲 Launch-ready state pending

### Immediate Next Steps (Pre-Launch)
1. Implement Stripe usage-based billing
2. Build invoice generation (1st of month, prior month completions)
3. Finalize core order workflow (import → assign → complete → submit)
4. Confirm founding customer is using it for real orders
5. Form LLC, get ToS/MSA drafted
6. Set pricing at $0.25/order
7. Add self-serve signup flow

---

## 11. Revenue Projections

| Customers | Avg Orders/Month Each | Monthly Revenue @ $0.25 |
|---|---|---|
| 1 (founding) | 11,400 | $2,850 |
| 5 customers | 3,000 avg | $3,750 |
| 10 customers | 3,000 avg | $7,500 |
| 25 customers | 3,000 avg | $18,750 |
| 50 customers | 3,000 avg | $37,500/mo = $450K/yr |

The founding customer alone at $0.25/order = **$34,200/year** from one account.

---

## 12. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| InspectorADE price-matches | Compete on UX, self-serve, modern mobile app |
| EZ Inspections already at $0.15/order | They have dated UI and no real self-serve — still a UX win |
| Nationals change their file formats | Build parsers as modular plugins, easy to update |
| Customer churns after data import | Solve switching cost the other way — make migrating FROM your app hard |
| Foreclosure volume drops (good economy) | Still ~1-2% delinquency rate always; also expand to insurance inspections |

---

*Document generated from founder research session. Last updated: March 2026.*
