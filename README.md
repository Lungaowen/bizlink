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

- **Suppliers** â provide stock and inputs
- **Township businesses** â stock in (buy stock, sell products), goods out
- **Consumers** â customers and other businesses

### System flow

```mermaid
flowchart LR
    S["Suppliers<br/>Wholesalers, distributors"] -->|"Stock in\n(bulk collection,\nconsolidated orders)"| B["Township business<br/>Buys stock, sells products"]
    B -->|"Goods out\n(landmark/geotag delivery)"| C["Consumers<br/>Customers &amp; businesses"]
```

## Competitors

- **KasiD** â B2B logistics pivot providing stable revenue beyond consumer food delivery; strong brand recognition as a pioneer in the space.
- **Spaza Eats** â building a full-fledged ecosystem for township commerce (delivery, fintech, merchant funding); rebranded to Spaza Market, signalling ambition beyond food delivery.
- **NouNou** â core claim is affordability; a real-world comparison showed the same meal being R45 cheaper than a national competitor, achieved via a lean operational model.
- **MDZ Go** â a pure hyperlocal play, laser-focused on a single township, with strong community trust and technical execution.
- **Delivery Ka Speed** â pivoted to B2B, becoming a last-mile logistics partner for major e-commerce/FMCG companies, securing high-volume stable revenue and rapid profitability.
- **Lupa Township Delivery** â model built entirely on community trust as a security and operational strategy.

## Uniqueness

- **Bulk collection service** â pick up stock from wholesalers, markets, and distributors, and deliver to spazas/shops within the same area.
- **Consolidated orders** â multiple small businesses combine orders (grouped within the same location) to reduce transportation costs.
- **Scheduled restocks** â daily/weekly fixed slots so businesses never run out of stock.
- **Landmark/geotag addressing** â easy navigation for local drivers (e.g. "Next to Boxer, near the big tree" + pin location).

## Commercialization

- **Pay-per-delivery** â a percentage of the service fee goes to BizLink, applied both when a business gets stock from suppliers and when a consumer gets finished goods from the business.
- **Subscription for drivers** â drivers pay a monthly subscription to use the platform, priced by vehicle type.

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

End-to-end delivery activity for both **Customers** and **Township Businesses**, from placing an order through driver assignment, pickup, delivery, and completion.

```mermaid
flowchart TD
    Start([Start]) --> Request{Who needs delivery?}

    Request -->|Customer| C1[Customer places an order]
    Request -->|Business| B1[Business places a stock/order request]

    C1 --> Validate[BizLink validates order and delivery location]
    B1 --> Validate

    Validate --> DriverCheck{Available driver nearby?}

    DriverCheck -->|No| Queue[Keep order pending and notify requester]
    Queue --> DriverCheck

    DriverCheck -->|Yes| Job[Create delivery job]
    Job --> Notify[Notify matched driver]

    Notify --> Accept{Driver accepts job?}

    Accept -->|No| DriverCheck
    Accept -->|Yes| Confirm[Notify requester that a driver has been assigned]

    Confirm --> Pickup[Driver travels to pickup location]
    Pickup --> PickupCheck{Order ready for collection?}

    PickupCheck -->|No| Wait[Driver waits / requester or business is notified]
    Wait --> PickupCheck

    PickupCheck -->|Yes| Collect[Driver collects order]
    Collect --> Track[BizLink starts delivery tracking]

    Track --> Deliver[Driver delivers to customer or business]
    Deliver --> Proof[Driver submits delivery confirmation]

    Proof --> Received{Recipient confirms receipt?}

    Received -->|Yes| Complete[Mark delivery as completed]
    Received -->|No| Dispute[Open delivery issue / dispute]

    Complete --> NotifyDone[Notify requester and update order status]
    Dispute --> Resolve[Resolve delivery issue]
    Resolve --> NotifyDone

    NotifyDone --> End([End])
```

### Delivery actors

- **Customer** — places a purchase order and receives delivery updates.
- **Business** — can request stock/deliveries and can also be the destination for supplier restocking.
- **Driver** — receives available delivery jobs, accepts a job, collects the order, delivers it, and confirms completion.
- **BizLink** — validates orders, matches nearby drivers, sends notifications, tracks delivery status, and records completion.
