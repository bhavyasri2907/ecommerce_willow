package com.willow.controller;

import com.willow.dto.request.AddressRequest;
import com.willow.dto.response.AddressDto;
import com.willow.security.CustomerContext;
import com.willow.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The signed-in shopper's address book (My Account > Addresses, and checkout). */
@RestController
@RequestMapping("/api/account/addresses")
public class AddressController {

    private final AddressService addressService;
    private final CustomerContext customer;

    public AddressController(AddressService addressService, CustomerContext customer) {
        this.addressService = addressService;
        this.customer = customer;
    }

    @GetMapping
    public List<AddressDto> list() {
        return addressService.list(customer.customerId());
    }

    @PostMapping
    public ResponseEntity<AddressDto> create(@Valid @RequestBody AddressRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.create(customer.customerId(), req));
    }

    @PutMapping("/{id}")
    public AddressDto update(@PathVariable Long id, @Valid @RequestBody AddressRequest req) {
        return addressService.update(customer.customerId(), id, req);
    }

    @PatchMapping("/{id}/default")
    public AddressDto makeDefault(@PathVariable Long id) {
        return addressService.makeDefault(customer.customerId(), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        addressService.delete(customer.customerId(), id);
        return ResponseEntity.noContent().build();
    }
}
