# BizLink

**By Tech Crusaders**

## Background

Townships in Tshwane are full of small businesses selling products and services, but goods move through a scattered ecosystem. Courier and ride-hailing services cost small businesses too much, and without affordable delivery, entrepreneurs cannot reach more customers.

## Problem Statement

- High costs of delivering goods/services
- Delays and unreliable services
- Local businesses do not have online visibility
- Consumers are limited according to area of residence
- Crime affects business reputation and finances

## Proposed Solution

One centralised system connecting businesses to their suppliers and their customers:

- **Suppliers** — provide stock and inputs
- **Township businesses** — stock in (buy stock, sell products), goods out
- **Consumers** — customers and other businesses

### System flow

```mermaid
flowchart LR
    S["Suppliers<br/>Wholesalers, distributors"] -->|"Stock in\n(bulk collection,\nconsolidated orders)"| B["Township business<br/>Buys stock, sells products"]
    B -->|"Goods out\n(landmark/geotag delivery)"| C["Consumers<br/>Customers &amp; businesses"]
```

## Competitors

- **KasiD** — B2B logistics pivot providing stable revenue beyond consumer food delivery; strong brand recognition as a pioneer in the space.
- **Spaza Eats** — building a full-fledged ecosystem for township commerce (delivery, fintech, merchant funding); rebranded to Spaza Market, signalling ambition beyond food delivery.
- **NouNou** — core claim is affordability; a real-world comparison showed the same meal being R45 cheaper than a national competitor, achieved via a lean operational model.
- **MDZ Go** — a pure hyperlocal play, laser-focused on a single township, with strong community trust and technical execution.
- **Delivery Ka Speed** — pivoted to B2B, becoming a last-mile logistics partner for major e-commerce/FMCG companies, securing high-volume stable revenue and rapid profitability.
- **Lupa Township Delivery** — model built entirely on community trust as a security and operational strategy.

## Uniqueness

- **Bulk collection service** — pick up stock from wholesalers, markets, and distributors, and deliver to spazas/shops within the same area.
- **Consolidated orders** — multiple small businesses combine orders (grouped within the same location) to reduce transportation costs.
- **Scheduled restocks** — daily/weekly fixed slots so businesses never run out of stock.
- **Landmark/geotag addressing** — easy navigation for local drivers (e.g. "Next to Boxer, near the big tree" + pin location).

## Commercialization

- **Pay-per-delivery** — a percentage of the service fee goes to BizLink, applied both when a business gets stock from suppliers and when a consumer gets finished goods from the business.
- **Subscription for drivers** — drivers pay a monthly subscription to use the platform, priced by vehicle type.

### Revenue flow

```mermaid
flowchart TD
    Biz["Township business"] -->|"% service fee\non stock orders"| BL(("BizLink"))
    Cons["Consumer"] -->|"% service fee\non purchases"| BL
    Drv["Driver"] -->|"Monthly subscription\n(by vehicle type)"| BL
```

## Diagrams

### Sequence diagram

A business ordering restock, BizLink consolidating and dispatching a driver, and a consumer purchase.

```mermaid
sequenceDiagram
    participant Biz as Township business
    participant App as BizLink platform
    participant Sup as Supplier
    participant Drv as Driver
    participant Con as Consumer

    Biz->>App: Place stock order
    App->>App: Consolidate with nearby orders
    App->>Sup: Request bulk collection
    Sup-->>App: Confirm stock ready
    App->>Drv: Assign collection & delivery route
    Drv->>Sup: Collect consolidated stock
    Drv->>Biz: Deliver stock
    Biz->>App: Confirm receipt & pay service fee
    Con->>Biz: Purchase product
    Biz->>App: Log sale
    App->>Drv: Assign consumer delivery (if needed)
    Drv->>Con: Deliver goods
    Con->>App: Pay (service fee applied)
```

### Data flow diagram (DFD)

External entities (rounded), processes (circles), and data stores (cylinders).

```mermaid
flowchart LR
    Sup([Supplier])
    Biz([Township business])
    Con([Consumer])
    Drv([Driver])

    Sup -->|Stock data| P1(("1.0 Bulk collection &<br/>consolidation"))
    Biz -->|Order request| P1
    P1 -->|Consolidated order| DS1[(Orders DB)]
    P1 -->|Route plan| P2(("2.0 Delivery<br/>scheduling"))
    DS1 -->|Order details| P2
    P2 -->|Assignment| Drv
    Drv -->|Delivery confirmation| P3(("3.0 Payment &<br/>fee processing"))
    Con -->|Purchase data| P3
    P3 -->|Transaction record| DS2[(Payments DB)]
    P3 -->|Receipt| Biz
    P3 -->|Receipt| Con
```

### Activity diagram

End-to-end order fulfillment, from a business placing an order to payment.

```mermaid
flowchart TD
    Start([Business places order]) --> Check{Order within<br/>consolidation window?}
    Check -->|Yes| Wait[Wait & batch with<br/>nearby orders]
    Check -->|No| Immediate[Process immediately]
    Wait --> Assign[Assign driver &<br/>collection route]
    Immediate --> Assign
    Assign --> Collect[Driver collects stock<br/>from supplier]
    Collect --> Deliver[Driver delivers to<br/>business]
    Deliver --> Confirm{Business confirms<br/>receipt?}
    Confirm -->|Yes| Pay[Pay service fee]
    Confirm -->|No| Dispute[Raise dispute]
    Pay --> End([Order complete])
    Dispute --> End
```
