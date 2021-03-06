package com.wms.wms_server.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import com.wms.wms_server.model.user.WMSUser;

import com.wms.wms_server.model.response.LocationResponse;
import com.wms.wms_server.model.locations.Area;
import com.wms.wms_server.model.locations.Location;
import com.wms.wms_server.model.request.LocationRequest;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

import com.wms.wms_server.repository.AreaRepository;
import com.wms.wms_server.repository.LocationRepository;
import com.wms.wms_server.services.LocationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.wms.wms_server.services.OAuthUserService;

@Controller
public class LocationController {
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private AreaRepository AreaRepository;
    @Autowired
	OAuthUserService oAuthUserService;

    @Autowired
    private LocationService locationService;

    @GetMapping("/locations")
    @ResponseBody
    public List<LocationResponse> get_locations(@AuthenticationPrincipal OAuth2User principal) {
        // Test print out oauth user  unfo
        // WMSUser u = oAuthUserService.getOrMakeUser(principal);
        System.out.println(principal);
        var a = principal.getAttribute("groups");
        System.out.println(a);
        ArrayList<LocationResponse> locs = new ArrayList<LocationResponse>();
        return locationService.convertLocations(locationRepository.findAll());
    }

    // @GetMapping(value={"/"})
    // public String view_index() {
    //     return "index";
    // }

    @RequestMapping(path="/locations/{locationId}", produces="text/plain", method=RequestMethod.DELETE)
    public ResponseEntity<String> delete_location(@PathVariable("locationId") Integer locationId) {
        locationRepository.deleteById(locationId);
        return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
    }

    @GetMapping(value={"/view_locations"})
    public String view_locations() {
        return "locations/view_locations";
    }

    // @GetMapping(value={"/create_user"})
    // @ResponseBody
    // public String create_user() {
    //     List<User> users = userRepository.findAll();
    //     if (users.isEmpty()) {
    //         WMSUser u = new User("email@test.com", "usera", "password");
    //         userRepository.save(u);
    //         System.out.println("created user");
    //     }
    //     return "HELLO";
    // }

    @GetMapping(path="/locations/area/{areaId}", produces="application/json")
    @ResponseBody
    public List<LocationResponse> get_locations_by_area(@PathVariable("areaId") Long areaId) {
        return locationService.convertLocations(
            locationService.getLocationsByArea(areaId));
    }

    @GetMapping(path="/locations/warehouse/{warehouseId}", produces="application/json")
    @ResponseBody
    public List<LocationResponse> getLocationsByWarehouse(@PathVariable("warehouseId") Long warehouseId) {
        return locationService.convertLocations(
            locationRepository.findByWarehouseId(warehouseId));
    }
}