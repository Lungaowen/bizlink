# Driver notification & assignment \u2014 technical design

## Problem
When a township business adds stock to a consolidation batch, the batch eventually closes. At that moment BizLink must **notify available local drivers** and **assign one** so the business sees progress (not a dead end).

## Happy path (business view)

1. Business places / joins order \u2192 status **Batching**
2. Consolidation window open (other shops can join)
3. Window closes (timer, full batch, or manual close)
4. System creates a **delivery job** and **notifies nearby drivers**
5. First eligible driver **accepts** \u2192 status **Driver assigned**
6. Driver collects from supplier(s) \u2192 **Collecting / En route**
7. Driver delivers to each shop in the batch \u2192 **Delivered**

## Real system components

| Component | Role |
|-----------|------|
| **Orders service** | Creates orders, manages batch membership |
| **Batch scheduler** | Closes windows (time / size / supplier cut-off) |
| **Dispatch service** | Builds job, ranks drivers, sends offers |
| **Notification service** | Push (FCM/APNs), SMS (e.g. Africa's Talking), WhatsApp optional |
| **Driver app** | Receive offer, accept/decline, navigation, proof of delivery |
| **Realtime channel** | WebSocket / Supabase realtime / Firebase so business dashboard updates live |

## Matching rules (MVP)

- Driver must be **online**, **subscribed**, and within ~5\u20138 km of the supplier or batch centroid
- Prefer vehicle capacity that fits the consolidated load
- Score by: distance, acceptance rate, on-time rate, community rating
- Offer to top N drivers (e.g. 3\u20135) in parallel with a short timeout (45\u201390s)
- First accept wins; others get "job taken"
- If no accept: widen radius / re-offer / escalate to ops

## Notification content (driver)

```
New BizLink job \u00b7 Soshanguve South
3 shops \u00b7 Boitumelo Wholesalers + Central Distributors
Est. R85 fee \u00b7 ~12 km loop
Accept within 60s
```

## Business-facing states

| Status | Meaning |
|--------|--------|
| Batching | Waiting for more shops / window |
| Notifying drivers | Batch closed, offers sent |
| Driver assigned | Named driver + vehicle + ETA |
| Collecting | At supplier(s) |
| Out for delivery | En route to shops |
| Delivered | Confirmed (photo / signature / OTP) |
| Issue | Dispute / failed attempt |

## Data sketch

```
batches: id, area, window_ends_at, status, supplier_stops[]
orders: id, batch_id, business_id, items[], status
jobs: id, batch_id, driver_id?, status, fee, route
driver_offers: job_id, driver_id, sent_at, expires_at, response
drivers: id, vehicle_type, capacity, location, online, subscription_ok
```

## Prototype behaviour (what you can try now)

On **Orders**:
- Consolidation countdown runs (~45s for demo)
- Or click **Close batch now**
- UI shows "Notifying nearby drivers\u2026"
- Then a random mock driver is assigned (Kabelo / Precious / Thabo)
- Status pills flip to **Driver assigned**
- **Track delivery** goes to Deliveries with the same driver card

This is front-end only (sessionStorage). A real backend would own batch close, offers, and push.

## Next build steps

1. Driver registration + online/offline toggle
2. Batch close API + job creation
3. Push notifications to driver devices
4. Accept endpoint + exclusive lock on job
5. Live status to business dashboard
6. Proof of delivery + fee settlement
