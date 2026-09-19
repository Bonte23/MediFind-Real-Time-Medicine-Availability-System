# MediFind REST API Documentation

**Base API URL:** `http://localhost:5000/api`  
**Authentication Scheme:** `Bearer <JWT_TOKEN>` in HTTP `Authorization` Header  
**Content-Type:** `application/json` (except multipart uploads for prescriptions)  

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new patient or pharmacy account.
* **Request Body (Patient):**
  ```json
  {
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password@123",
    "role": "patient",
    "phone": "+1-212-555-0199",
    "address": "120 Broadway, New York"
  }
  ```
* **Request Body (Pharmacist):**
  ```json
  {
    "full_name": "Dr. Sarah Jenkins",
    "email": "sarah@citypharm.com",
    "password": "Password@123",
    "role": "pharmacist",
    "phone": "+1-212-555-0144",
    "pharmacy_name": "CityCare Central Pharmacy",
    "license_number": "PHARM-NY-2024-998",
    "pharmacy_address": "450 Lexington Ave",
    "pharmacy_city": "New York",
    "opening_hours": "08:00 AM - 10:00 PM",
    "is_24_hours": false
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "token": "eyJhbGciOi...",
    "user": { "user_id": 9, "full_name": "Jane Doe", "role": "patient" }
  }
  ```

### `POST /api/auth/login`
Authenticates user and returns JWT token.
* **Request Body:**
  ```json
  {
    "email": "patient@medifind.com",
    "password": "Patient@123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "user_id": 1,
      "full_name": "Alex Mercer",
      "email": "patient@medifind.com",
      "role": "patient",
      "pharmacy": null
    }
  }
  ```

### `GET /api/auth/profile` *(Protected)*
Returns profile details of the authenticated user.

### `PUT /api/auth/profile` *(Protected)*
Updates user contact details and GPS coordinates.

---

## 2. Medicine Catalogue Endpoints (`/api/medicines`)

### `GET /api/medicines`
Queries the master medicine catalog with real-time stock counts across pharmacies.
* **Query Parameters:**
  * `search` (string) — Search term for medicine brand or generic name.
  * `category` (string) — Filter by therapeutic category.
  * `dosage_form` (string) — Filter by form (Tablet, Syrup, Injection, etc.).
  * `prescription` (boolean) — Filter by Rx requirement.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 16,
    "data": [
      {
        "medicine_id": 1,
        "medicine_name": "Amoxicillin 500mg",
        "generic_name": "Amoxicillin Trihydrate",
        "category": "Antibiotics",
        "dosage_form": "Capsule",
        "pharmacies_with_stock": 3,
        "lowest_price": 12.50
      }
    ]
  }
  ```

### `GET /api/medicines/:id`
Retrieves detailed medicine information along with a list of all pharmacies currently stocking it, unit pricing, and distance from patient GPS coordinates.
* **Query Parameters:** `lat`, `lng`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "medicine": { "medicine_id": 1, "medicine_name": "Amoxicillin 500mg" },
    "stocking_pharmacies": [
      {
        "pharmacy_id": 1,
        "pharmacy_name": "MetroCare 24/7 Pharmacy",
        "available_stock": 42,
        "price": 12.50,
        "distance_km": 1.45
      }
    ]
  }
  ```

---

## 3. Pharmacy Locator Endpoints (`/api/pharmacies`)

### `GET /api/pharmacies`
Returns verified pharmacies with Haversine distance from given coordinates and radius filter.
* **Query Parameters:**
  * `lat` (number, required for distance)
  * `lng` (number, required for distance)
  * `radius` (number, km — default 25)
  * `is_24_hours` (boolean)
  * `search` (string)
* **Response (200 OK):** Returns pharmacy cards sorted by nearest distance.

### `GET /api/pharmacies/:id`
Returns store profile, location, operating schedule, and complete active medicine inventory.

---

## 4. Inventory Management Endpoints (`/api/inventory`)

### `GET /api/inventory/my-inventory` *(Pharmacist Only)*
Returns inventory items for the pharmacist's dispensary with calculated dynamic status (`In Stock`, `Low Stock`, `Out of Stock`, `Expired`) and total asset valuation.

### `POST /api/inventory` *(Pharmacist Only)*
Adds a medicine to dispensary stock with quantity, price, batch number, and expiration date.

### `PUT /api/inventory/:id` *(Pharmacist Only)*
Updates physical stock quantity, retail price, or batch information.

### `DELETE /api/inventory/:id` *(Pharmacist Only)*
Removes an inventory record from dispensary.

---

## 5. Reservation Endpoints (`/api/reservations`)

### `POST /api/reservations` *(Patient / Authenticated)*
Locks stock units in the pharmacy's inventory and issues a reservation code.
* **Request Body:**
  ```json
  {
    "pharmacy_id": 1,
    "medicine_id": 1,
    "quantity": 2,
    "prescription_image": "/uploads/prescriptions/rx-123.jpg"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Medicine reserved successfully. Stock locked for 24 hours.",
    "reservation_code": "RES-2024-8192",
    "total_price": 25.00
  }
  ```

### `GET /api/reservations` *(Protected)*
Returns reservation history filtered by role:
* **Patient:** Returns patient's holds.
* **Pharmacist:** Returns incoming reservations for dispensary.
* **Admin:** Returns all system reservations.

### `PUT /api/reservations/:id/status` *(Protected)*
Updates status (`Confirmed`, `Collected`, `Cancelled`, `Rejected`).
* Automatically deducts physical inventory when transitioning to `Collected`.
* Automatically releases locked inventory when transitioning to `Cancelled` or `Rejected`.

---

## 6. Prescription Upload Endpoints (`/api/prescriptions`)

### `POST /api/prescriptions/upload` *(Protected, multipart/form-data)*
Uploads a physical prescription photo or document.
* **Form Data:**
  * `prescription` (File: PNG, JPG, WEBP, PDF)
  * `pharmacy_id` (optional INT)
  * `notes` (optional text)

### `PUT /api/prescriptions/:id/review` *(Pharmacist Only)*
Allows pharmacist to mark prescription as `reviewed` or `rejected` with clinical notes.

---

## 7. Administrator Control Endpoints (`/api/admin`)

### `GET /api/admin/dashboard` *(Admin Only)*
Returns dynamic system stats (total users, active pharmacies, pending approvals, stockout warnings, top requested medicines, monthly trends).

### `PUT /api/admin/pharmacies/:id/approval` *(Admin Only)*
Approves or rejects pharmacy facility registration.

### `PUT /api/admin/users/:id/status` *(Admin Only)*
Activates or suspends user account.

### `GET /api/admin/audit-logs` *(Admin Only)*
Returns immutable system audit trail with user actions and IP addresses.

---

## 8. Export Reports Endpoints (`/api/reports`)

### `GET /api/reports/inventory?format=csv` *(Protected)*
Streams a downloadable CSV spreadsheet of inventory valuation.

### `GET /api/reports/reservations?format=csv` *(Protected)*
Streams a downloadable CSV spreadsheet of all customer reservation records.
