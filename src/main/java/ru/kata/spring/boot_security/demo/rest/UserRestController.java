package ru.kata.spring.boot_security.demo.rest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;

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

    // Получить пользователя по ID (без if и проверок на null)
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return Optional.ofNullable(userService.getById(id))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Создать пользователя (без if и проверок на null)
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        user.setRoles(resolveRoles(user));
        userService.save(user);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    // Обновить пользователя (без if и проверок на null)
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        user.setRoles(resolveRoles(user));
        userService.updateUser(user);
        return ResponseEntity.ok(user);
    }

    // Удалить пользователя
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Текущий пользователь (Spring сам внедрит Authentication)
    @GetMapping("/current")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.findByUsername(authentication.getName()));
    }

    // ===== Упрощённое сопоставление ролей без if / null-checks =====
    private Set<Role> resolveRoles(User user) {
        return Optional.ofNullable(user.getRoles())
                .orElseGet(Set::of)                          // пустое множество, если ролей нет
                .stream()
                .map(Role::getName)                          // берём имена ролей
                .map(roleService::getRoleByName)             // резолвим из БД
                .filter(Objects::nonNull)                    // отбрасываем не найденные
                .collect(Collectors.toSet());
    }
}
