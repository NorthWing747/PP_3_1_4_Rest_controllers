package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RoleService roleService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow();
    }

    @Override
    public void save(User user) {
        // шифруем пароль
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // при желании — резолвим роли по имени (если приходит [{name:"ROLE_USER"}])
        if (user.getRoles() != null) {
            user.setRoles(resolveRoles(user.getRoles()));
        }
        userRepository.save(user);
    }

    @Override
    public void updateUser(User user) {
        User existing = userRepository.findById(user.getId())
                .orElseThrow();

        existing.setUsername(user.getUsername());
        existing.setEmail(user.getEmail());

        if (user.getRoles() != null) {
            existing.setRoles(resolveRoles(user.getRoles()));
        }

        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        userRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
          userRepository.deleteById(id);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow();
    }

    private Set<Role> resolveRoles(Set<Role> incoming) {
        return incoming.stream()
                .map(Role::getName)
                .map(roleService::getRoleByName)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }
}
