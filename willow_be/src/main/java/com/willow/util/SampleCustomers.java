package com.willow.util;

import java.util.List;
import java.util.Random;

/** Customer details for the opt-in live order simulator (Settings > Developer tools). */
public final class SampleCustomers {

    public record Customer(String name, String email, String phone, String address, String city, String state, String pincode) {}

    private static final String[] FIRST = {
            "Aarav", "Ananya", "Diya", "Ishaan", "Kavya", "Meera", "Nikhil", "Priya", "Rohan", "Saanvi",
            "Tanvi", "Vivaan", "Aditi", "Arjun", "Isha", "Kabir", "Neha", "Riya", "Sneha", "Zara"
    };
    private static final String[] LAST = {
            "Sharma", "Iyer", "Reddy", "Mehta", "Kapoor", "Nair", "Gupta", "Rao", "Patel", "Menon",
            "Singh", "Das", "Joshi", "Verma", "Bose"
    };
    /** City, state and a pincode prefix in that city. */
    private static final List<String[]> CITIES = List.of(
            new String[]{"Bengaluru", "Karnataka", "560"}, new String[]{"Mumbai", "Maharashtra", "400"},
            new String[]{"Hyderabad", "Telangana", "500"}, new String[]{"Delhi", "Delhi", "110"},
            new String[]{"Chennai", "Tamil Nadu", "600"}, new String[]{"Pune", "Maharashtra", "411"},
            new String[]{"Kolkata", "West Bengal", "700"}, new String[]{"Ahmedabad", "Gujarat", "380"},
            new String[]{"Jaipur", "Rajasthan", "302"}, new String[]{"Kochi", "Kerala", "682"});
    private static final String[] STREETS = {
            "MG Road", "Residency Road", "Linking Road", "Banjara Hills Rd 12", "Anna Salai", "FC Road", "Park Street"
    };

    private SampleCustomers() {}

    public static Customer random(Random r) {
        String first = FIRST[r.nextInt(FIRST.length)];
        String last = LAST[r.nextInt(LAST.length)];
        String[] city = CITIES.get(weightedCityIndex(r));
        String email = (first + "." + last + (r.nextInt(90) + 10)).toLowerCase() + "@example.com";
        String phone = "9" + (100000000 + r.nextInt(899999999));
        String address = (r.nextInt(240) + 1) + ", " + STREETS[r.nextInt(STREETS.length)];
        String pincode = city[2] + String.format("%03d", r.nextInt(100) + 1);
        return new Customer(first + " " + last, email, phone, address, city[0], city[1], pincode);
    }

    /** Metro cities order more often than smaller ones. */
    private static int weightedCityIndex(Random r) {
        int idx = (int) Math.floor(Math.pow(r.nextDouble(), 1.6) * CITIES.size());
        return Math.min(idx, CITIES.size() - 1);
    }
}
