package ru.kata.spring.boot_security.demo.rest;

//import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    private final UserService userService;
    private final RoleService roleService;

    public UserRestController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    // Получить всех пользователей
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAll();
    }

    // Получить пользователя по ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getById(id);
        return user != null
                ? ResponseEntity.ok(user)
                : ResponseEntity.notFound().build();
    }

    // Создать пользователя
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        Set<Role> roles = resolveRoles(user);
        user.setRoles(roles);
        userService.save(user);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    // Обновить пользователя
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        Set<Role> roles = resolveRoles(user);
        user.setRoles(roles);
        userService.updateUser(user);
        return ResponseEntity.ok(user);
    }

    // Удалить пользователя
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===== ВСПОМОГАТЕЛЬНЫЙ МЕТОД =====
    private Set<Role> resolveRoles(User user) {
        Set<Role> resolvedRoles = new HashSet<>();

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return resolvedRoles;
        }

        for (Role role : user.getRoles()) {
            Role existingRole = roleService.getRoleByName(role.getName());
            if (existingRole != null) {
                resolvedRoles.add(existingRole);
            }
        }

        return resolvedRoles;
    }
    @GetMapping("/current")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        // Spring автоматически внедряет Authentication
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return ResponseEntity.ok(user);
    }
}
