import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use data migration (with-clause) to persist previous bookings and to introduce a persistent experts variable.
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Booking {
    type BookingId = Nat;

    type ServiceType = {
      #manicure;
      #pedicure;
      #gelNails;
      #acrylicNails;
    };

    public type Status = {
      #pending;
      #confirmed;
      #completed;
      #cancelled;
    };

    public type Booking = {
      id : BookingId;
      name : Text;
      phone : Text;
      address : Text;
      date : Time.Time;
      serviceType : ServiceType;
      notes : Text;
      status : Status;
      expertId : Nat;
    };

    public type BookingInput = {
      name : Text;
      phone : Text;
      address : Text;
      date : Time.Time;
      serviceType : ServiceType;
      notes : Text;
      expertId : Nat;
    };

    public type BookingOutput = {
      id : BookingId;
      name : Text;
      phone : Text;
      address : Text;
      date : Time.Time;
      serviceType : ServiceType;
      notes : Text;
      status : Status;
      createdAt : Time.Time;
      updatedAt : Time.Time;
      expertId : Nat;
    };
  };

  public type Expert = {
    id : Nat;
    name : Text;
    experience : Nat;
    appointmentsDone : Nat;
    rating : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextBookingId = 0;
  let bookings = Map.empty<Nat, Booking.Booking>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let experts = Map.empty<Nat, Expert>();

  func convertBookingToOutput(booking : Booking.Booking) : Booking.BookingOutput {
    {
      id = booking.id;
      name = booking.name;
      phone = booking.phone;
      address = booking.address;
      date = booking.date;
      serviceType = booking.serviceType;
      notes = booking.notes;
      status = booking.status;
      createdAt = booking.date;
      updatedAt = booking.date;
      expertId = booking.expertId;
    };
  };

  // Expert management
  public query func getExperts() : async [Expert] {
    experts.values().toArray();
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Booking management
  public shared ({ caller }) func submitBooking(bookingInput : Booking.BookingInput) : async Nat {
    // No authorization check - anyone including guests can submit bookings
    let bookingId = nextBookingId;
    let booking : Booking.Booking = {
      id = bookingId;
      name = bookingInput.name;
      phone = bookingInput.phone;
      address = bookingInput.address;
      date = bookingInput.date;
      serviceType = bookingInput.serviceType;
      notes = bookingInput.notes;
      status = #pending;
      expertId = bookingInput.expertId;
    };

    bookings.add(bookingId, booking);
    nextBookingId += 1;
    bookingId;
  };

  public query ({ caller }) func getAllBookings() : async [Booking.BookingOutput] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray().map(func(booking) { convertBookingToOutput(booking) });
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : Booking.Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        let updatedBooking : Booking.Booking = {
          booking with
          status;
        };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };
};
