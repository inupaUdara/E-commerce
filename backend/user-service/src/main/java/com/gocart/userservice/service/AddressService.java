package com.gocart.userservice.service;

import com.gocart.userservice.dto.AddressRequest;
import com.gocart.userservice.entity.Address;
import com.gocart.userservice.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public Address createAddress(String userId, AddressRequest request) {
        Address address = Address.builder()
                .userId(userId)
                .name(request.getName())
                .email(request.getEmail())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .country(request.getCountry())
                .phone(request.getPhone())
                .build();
        return addressRepository.save(address);
    }

    public Optional<Address> getAddressById(String id) {
        return addressRepository.findById(id);
    }

    public List<Address> getAddressesByUserId(String userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address updateAddress(String id, AddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (request.getName() != null) address.setName(request.getName());
        if (request.getEmail() != null) address.setEmail(request.getEmail());
        if (request.getStreet() != null) address.setStreet(request.getStreet());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getZip() != null) address.setZip(request.getZip());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getPhone() != null) address.setPhone(request.getPhone());
        
        return addressRepository.save(address);
    }

    public void deleteAddress(String id) {
        addressRepository.deleteById(id);
    }
}
