package com.willow.service;

import com.willow.dto.request.AddressRequest;
import com.willow.dto.response.AddressDto;
import com.willow.entity.Address;
import com.willow.entity.Customer;
import com.willow.exception.NotFoundException;
import com.willow.repository.AddressRepository;
import com.willow.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * A shopper's address book. Exactly one address is the default whenever the book is not
 * empty: the first one saved becomes it, and deleting it promotes the newest remaining one.
 */
@Service
public class AddressService {

    private static final int MAX_ADDRESSES = 10;

    private final AddressRepository addresses;
    private final CustomerRepository customers;

    public AddressService(AddressRepository addresses, CustomerRepository customers) {
        this.addresses = addresses;
        this.customers = customers;
    }

    @Transactional(readOnly = true)
    public List<AddressDto> list(Long customerId) {
        return addresses.findForCustomer(customerId).stream().map(AddressDto::from).toList();
    }

    @Transactional
    public AddressDto create(Long customerId, AddressRequest req) {
        long existing = addresses.countByCustomerId(customerId);
        if (existing >= MAX_ADDRESSES) {
            throw new IllegalStateException("You can save up to " + MAX_ADDRESSES + " addresses. Remove one to add another.");
        }
        Customer customer = customers.getReferenceById(customerId);
        boolean makeDefault = existing == 0 || Boolean.TRUE.equals(req.makeDefault());
        if (makeDefault) addresses.clearDefault(customerId);

        Address a = new Address(customer);
        apply(a, req);
        a.setDefaultAddress(makeDefault);
        return AddressDto.from(addresses.saveAndFlush(a));
    }

    @Transactional
    public AddressDto update(Long customerId, Long id, AddressRequest req) {
        Address a = find(customerId, id);
        if (Boolean.TRUE.equals(req.makeDefault()) && !a.isDefaultAddress()) {
            addresses.clearDefault(customerId);
            a = find(customerId, id); // the bulk update cleared the persistence context
            a.setDefaultAddress(true);
        }
        apply(a, req);
        return AddressDto.from(addresses.saveAndFlush(a));
    }

    @Transactional
    public AddressDto makeDefault(Long customerId, Long id) {
        find(customerId, id);
        addresses.clearDefault(customerId);
        Address a = find(customerId, id);
        a.setDefaultAddress(true);
        return AddressDto.from(addresses.saveAndFlush(a));
    }

    @Transactional
    public void delete(Long customerId, Long id) {
        Address a = find(customerId, id);
        boolean wasDefault = a.isDefaultAddress();
        addresses.delete(a);
        addresses.flush();
        if (wasDefault) {
            addresses.findForCustomer(customerId).stream().findFirst().ifPresent(next -> {
                next.setDefaultAddress(true);
                addresses.saveAndFlush(next);
            });
        }
    }

    /** One of the shopper's own addresses; another shopper's address looks exactly like a missing one. */
    @Transactional(readOnly = true)
    public Address find(Long customerId, Long id) {
        return addresses.findByIdAndCustomerId(id, customerId).orElseThrow(() -> new NotFoundException("address", id));
    }

    private static void apply(Address a, AddressRequest req) {
        a.setFullName(req.fullName().trim());
        a.setPhone(normalisePhone(req.phone()));
        a.setAddressLine(req.addressLine().trim());
        a.setCity(req.city().trim());
        a.setState(req.state().trim());
        a.setPincode(req.pincode().trim());
    }

    /** Stores Indian mobile numbers as their 10 digits, without +91 or separators. */
    static String normalisePhone(String phone) {
        String digits = phone.replaceAll("\\D", "");
        return digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
    }
}
