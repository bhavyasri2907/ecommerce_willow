package com.willow.util;

import com.willow.entity.PaymentMethod;

import java.util.List;
import java.util.Random;

/** Customer details for the opt-in live order simulator (Settings > Developer tools). */
public final class SampleCustomers {

    public record Customer(String name, String email, String phone, String city, String address) {}

    private static final String[] FIRST = {
            "Aarav", "Ananya", "Diya", "Ishaan", "Kavya", "Meera", "Nikhil", "Priya", "Rohan", "Saanvi",
            "Tanvi", "Vivaan", "Aditi", "Arjun", "Isha", "Kabir", "Neha", "Riya", "Sneha", "Zara"
    };
    private static final String[] LAST = {
            "Sharma", "Iyer", "Reddy", "Mehta", "Kapoor", "Nair", "Gupta", "Rao", "Patel", "Menon",
            "Singh", "Das", "Joshi", "Verma", "Bose"
    };
    private static final List<String> CITIES = List.of(
            "Bengaluru", "Mumbai", "Hyderabad", "Delhi", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Kochi");
    private static final String[] STREETS = {
            "MG Road", "Residency Road", "Linking Road", "Banjara Hills Rd 12", "Anna Salai", "FC Road", "Park Street"
    };

    private SampleCustomers() {}

    public static Customer random(Random r) {
        String first = FIRST[r.nextInt(FIRST.length)];
        String last = LAST[r.nextInt(LAST.length)];
        String city = CITIES.get(weightedCityIndex(r));
        String email = (first + "." + last + (r.nextInt(90) + 10)).toLowerCase() + "@example.com";
        String phone = "+91 9" + (100000000 + r.nextInt(899999999));
        String address = (r.nextInt(240) + 1) + ", " + STREETS[r.nextInt(STREETS.length)];
        return new Customer(first + " " + last, email, phone, city, address);
    }

    public static PaymentMethod randomPayment(Random r) {
        int roll = r.nextInt(100);
        if (roll < 52) return PaymentMethod.UPI;
        if (roll < 78) return PaymentMethod.CARD;
        if (roll < 86) return PaymentMethod.NET_BANKING;
        return PaymentMethod.COD;
    }

    /** Metro cities order more often than smaller ones. */
    private static int weightedCityIndex(Random r) {
        int idx = (int) Math.floor(Math.pow(r.nextDouble(), 1.6) * CITIES.size());
        return Math.min(idx, CITIES.size() - 1);
    }
}
