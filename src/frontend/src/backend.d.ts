import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type BookingId = bigint;
export type Time = bigint;
export interface BookingInput {
    serviceType: ServiceType;
    date: Time;
    name: string;
    expertId: bigint;
    address: string;
    notes: string;
    phone: string;
}
export interface Expert {
    id: bigint;
    name: string;
    experience: bigint;
    appointmentsDone: bigint;
    rating: number;
}
export interface BookingOutput {
    id: BookingId;
    status: Status;
    serviceType: ServiceType;
    date: Time;
    name: string;
    createdAt: Time;
    expertId: bigint;
    updatedAt: Time;
    address: string;
    notes: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export enum ServiceType {
    acrylicNails = "acrylicNails",
    pedicure = "pedicure",
    gelNails = "gelNails",
    manicure = "manicure"
}
export enum Status {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllBookings(): Promise<Array<BookingOutput>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExperts(): Promise<Array<Expert>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitBooking(bookingInput: BookingInput): Promise<bigint>;
    updateBookingStatus(bookingId: bigint, status: Status): Promise<void>;
}
