package com.wms.wms_server.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import com.wms.wms_server.model.user.User;

import com.wms.wms_server.model.response.LocationResponse;
import com.wms.wms_server.model.request.LocationRequest;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

import com.wms.wms_server.repository.LocationRepository;
import com.wms.wms_server.repository.UserRepository;
import com.wms.wms_server.services.LocationService;
import com.wms.wms_server.model.Location;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.ArrayList;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.wms.wms_server.services.OAuthUserService;

@Controller
public class LocationController {
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
	OAuthUserService oAuthUserService;

    @Autowired
    private LocationService locationService;

    @GetMapping("/locations")
    @ResponseBody
    public List<LocationResponse> get_locations(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> u = oAuthUserService.getUser(principal);
        for (Map.Entry<String, Object> entry : u.entrySet()) {
            System.out.println(entry.getKey() + " : " + entry.getValue());
        }
        ArrayList<LocationResponse> locs = new ArrayList<LocationResponse>();
        for(Location loc : locationRepository.findAll())  {
            locs.add(locationService.convertLocation(loc));
        }
        return locs;
    }

    // @RequestMapping(path="/locations", produces="text/plain", method=RequestMethod.POST)
    @RequestMapping(path="/locations", produces="application/json;", method=RequestMethod.POST)
    @ResponseBody
    public List<Location> create_location(@RequestBody LocationRequest lr) {
        List<Location> locs = locationService.buildLocations(lr);
        for (Location loc : locs) {
            locationRepository.save(loc);
        }
        return locs;
    }

    // @GetMapping(value={"/"})
    // public String view_index() {
    //     return "index";
    // }

    @RequestMapping(path="/locations/{locationId}", produces="text/plain", method=RequestMethod.DELETE)
    public ResponseEntity<String> delete_location(@PathVariable("locationId") String locationId) {
        System.out.println("delete " + locationId);
        locationRepository.deleteById(locationId);
        return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
    }

    @GetMapping(value={"/view_locations"})
    public String view_locations() {
        return "locations/view_locations";
    }

    @GetMapping(value={"/create_user"})
    @ResponseBody
    public String create_user() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            User u = new User("email@test.com", "usera", "password");
            userRepository.save(u);
            System.out.println("created user");
        }
        return "HELLO";
    }
}