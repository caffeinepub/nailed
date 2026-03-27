import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldBookingId = Nat;

  type OldServiceType = {
    #manicure;
    #pedicure;
    #gelNails;
    #acrylicNails;
  };

  type OldStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  type OldBooking = {
    id : OldBookingId;
    name : Text;
    phone : Text;
    address : Text;
    date : Time.Time;
    serviceType : OldServiceType;
    notes : Text;
    status : OldStatus;
  };

  type OldActor = {
    nextBookingId : Nat;
    bookings : Map.Map<Nat, OldBooking>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewBookingId = Nat;

  type NewServiceType = {
    #manicure;
    #pedicure;
    #gelNails;
    #acrylicNails;
  };

  type NewStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  type NewBooking = {
    id : NewBookingId;
    name : Text;
    phone : Text;
    address : Text;
    date : Time.Time;
    serviceType : NewServiceType;
    notes : Text;
    status : NewStatus;
    expertId : Nat;
  };

  type NewExpert = {
    id : Nat;
    name : Text;
    experience : Nat;
    appointmentsDone : Nat;
    rating : Float;
  };

  type NewActor = {
    nextBookingId : Nat;
    bookings : Map.Map<Nat, NewBooking>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    experts : Map.Map<Nat, NewExpert>;
  };

  public func run(old : OldActor) : NewActor {
    let newBookings = old.bookings.map<Nat, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        {
          oldBooking with
          expertId = 0;
        };
      }
    );

    let experts = Map.fromIter<Nat, NewExpert>([
      (
        0,
        {
          id = 0;
          name = "Sarah Nails";
          experience = 8;
          appointmentsDone = 500;
          rating = 4.8;
        },
      ),
      (
        1,
        {
          id = 1;
          name = "Emma Tull";
          experience = 5;
          appointmentsDone = 250;
          rating = 4.9;
        },
      ),
      (
        2,
        {
          id = 2;
          name = "Linda Schmidt";
          experience = 3;
          appointmentsDone = 100;
          rating = 4.7;
        },
      ),
      (
        3,
        {
          id = 3;
          name = "Anna Müller";
          experience = 2;
          appointmentsDone = 50;
          rating = 4.5;
        },
      ),
    ].values());

    {
      old with
      bookings = newBookings;
      experts;
    };
  };
};
