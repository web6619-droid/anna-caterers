"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";

export interface UserDetails {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export type MealType = "Breakfast" | "Lunch" | "Dinner" | string;

export interface EventDetails {
  eventType: string;
  guestCount: number;
  eventDate: string | Date;
  mealType: MealType;
  location?: string;
}

export interface SelectedMenuItem {
  id: string | number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
  [key: string]: any;
}

export interface BookingContextType {
  userDetails: UserDetails;
  eventDetails: EventDetails;
  selectedMenu: SelectedMenuItem[];
  perGuestTotal: number;
  cartTotal: number;
  updateUserDetails: (details: Partial<UserDetails>) => void;
  updateEventDetails: (details: Partial<EventDetails>) => void;
  addToMenu: (item: SelectedMenuItem) => void;
  removeFromMenu: (id: string | number) => void;
  isDishSelected: (id: string | number) => boolean;
  clearCart: () => void;
  resetBooking: () => void;
}

const defaultUserDetails: UserDetails = {
  name: "",
  phone: "",
  email: "",
  notes: "",
};

const defaultEventDetails: EventDetails = {
  eventType: "Wedding Catering",
  guestCount: 100,
  eventDate: "",
  mealType: "Lunch",
  location: "",
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [userDetails, setUserDetails] = useState<UserDetails>(defaultUserDetails);
  const [eventDetails, setEventDetails] = useState<EventDetails>(defaultEventDetails);
  const [selectedMenu, setSelectedMenu] = useState<SelectedMenuItem[]>([]);

  // Calculate price per guest based on selected culinary items
  const perGuestTotal = useMemo(() => {
    return selectedMenu.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [selectedMenu]);

  // Computed total cost: (Sum of all dishes selected) * (number of guests)
  const cartTotal = useMemo(() => {
    const guests = Number(eventDetails.guestCount) || 0;
    return perGuestTotal * guests;
  }, [perGuestTotal, eventDetails.guestCount]);

  const updateUserDetails = (details: Partial<UserDetails>) => {
    setUserDetails((prev) => ({ ...prev, ...details }));
  };

  const updateEventDetails = (details: Partial<EventDetails>) => {
    setEventDetails((prev) => ({ ...prev, ...details }));
  };

  const addToMenu = (item: SelectedMenuItem) => {
    setSelectedMenu((prev) => {
      // Avoid duplicating identical dishes in the cart
      if (prev.some((existing) => existing.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromMenu = (id: string | number) => {
    setSelectedMenu((prev) => prev.filter((item) => item.id !== id));
  };

  const isDishSelected = (id: string | number) => {
    return selectedMenu.some((item) => item.id === id);
  };

  const clearCart = () => {
    setSelectedMenu([]);
  };

  const resetBooking = () => {
    setSelectedMenu([]);
    setEventDetails({
      eventType: "",
      guestCount: 0,
      eventDate: "",
      mealType: "",
      location: "",
    });
    setUserDetails(defaultUserDetails);
  };

  const value: BookingContextType = {
    userDetails,
    eventDetails,
    selectedMenu,
    perGuestTotal,
    cartTotal,
    updateUserDetails,
    updateEventDetails,
    addToMenu,
    removeFromMenu,
    isDishSelected,
    clearCart,
    resetBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
