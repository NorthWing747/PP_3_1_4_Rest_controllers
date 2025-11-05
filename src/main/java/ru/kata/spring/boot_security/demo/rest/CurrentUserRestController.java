package ru.kata.spring.boot_security.demo.rest;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.service.UserService;

@RestController
public class CurrentUserRestController {

    private final UserService userService;

    public CurrentUserRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/user/current")
    public User getCurrentUser(Authentication auth) {
        return userService.findByUsername(auth.getName());
    }
}
