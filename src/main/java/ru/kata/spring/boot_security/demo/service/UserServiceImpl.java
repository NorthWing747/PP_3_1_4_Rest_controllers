package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import java.util.List;
import java.util.Objects;


@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleService roleService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found: " + id));
    }

    @Override
    public User save(User user) {
        // пароль
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // роли
        user.setRoles(resolveRoles(user.getRoles()));

        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) {
        User existing = getById(user.getId()); // без дублирования логики findById

        // простые поля
        existing.setUsername(user.getUsername()); // если есть логин
        existing.setName(user.getName());
        existing.setSurname(user.getSurname());
        existing.setAge(user.getAge());
        existing.setEmail(user.getEmail());

        // пароль (только если передан)
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // роли (если пришли — переустановим; если null — оставим как есть)
        if (user.getRoles() != null) {
            var resolved = resolveRoles(user.getRoles());       // Set<Role> из БД
            existing.getRoles().clear();                        // чистим managed-коллекцию
            existing.getRoles().addAll(resolved);               // и наполняем заново
        }

        return userRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        userRepository.delete(getById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found by username: " + username));
    }

    // При этом поддержим и name, чтобы фронт мог слать и имена.
    private java.util.Set<ru.kata.spring.boot_security.demo.entity.Role> resolveRoles(java.util.Set<ru.kata.spring.boot_security.demo.entity.Role> incoming) {
        if (incoming == null || incoming.isEmpty()) return java.util.Set.of();

        return incoming.stream()
                .map(r -> {
                    // приоритет — по id (замечание ментора)
                    if (r.getId() != null) {
                        return roleService.getById(r.getId()); // сделай такой метод в RoleService
                    }
                    // fallback — по name (чтобы не ломать фронт, если он шлёт name)
                    if (r.getName() != null) {
                        return roleService.getRoleByName(r.getName());
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toCollection(java.util.HashSet::new));
    }
}
