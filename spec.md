# Nailed

## Current State
Booking form collects: name, phone, address, date, service type, notes. No expert selection exists. Backend stores bookings without expert reference. Admin panel shows bookings without expert info.

## Requested Changes (Diff)

### Add
- Expert data type with: id, name, experience (years), appointmentsDone, rating
- Expert list stored in backend with sample experts
- `getExperts` query to retrieve all experts
- `expertId` field on BookingInput and Booking types
- Expert selector in booking form showing: photo/avatar, name, years experience, appointments done, star rating
- Expert column in admin bookings table

### Modify
- `submitBooking` to accept expertId
- Booking form to include expert selection step (required field)
- Admin table to show selected expert per booking

### Remove
- Nothing

## Implementation Plan
1. Update Motoko backend: add Expert type, expert records, getExperts query, update Booking/BookingInput with expertId
2. Update frontend booking form: fetch experts, display expert cards with name/experience/appointments/rating, require selection before submit
3. Update admin panel: add Expert column to bookings table
