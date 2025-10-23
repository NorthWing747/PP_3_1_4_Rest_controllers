package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;

    }
    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }
    @Transactional
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void save(User user, List<Long> roleIds) {
        setRolesForUser(user, roleIds);

        userRepository.save(user);
    }

    public void updateUser(User user, List<Long> roleIds) {
        User existingUser = getById(user.getId());

        existingUser.setName(user.getName());
        existingUser.setSurname(user.getSurname());
        existingUser.setAge(user.getAge());
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setRoles(user.getRoles());

        // обновляем роли
        setRolesForUser(existingUser, roleIds);

        userRepository.save(existingUser);
    }

    private void setRolesForUser(User user, List<Long> roleIds) {
        Set<Role> roles = new HashSet<>();
        if (roleIds != null && !roleIds.isEmpty()) {
            roles.addAll(roleRepository.findAllById(roleIds));
        } else {
            roles.add(roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Default role not found")));
        }
        user.setRoles(roles);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    // Методы для REST CONTROLLER

    @Override
    public void save(User user) {
        // Если у пользователя уже есть роли - используем их
        // Если нет - назначаем роль по умолчанию (косяк, надо выбросить исключение)
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role defaultRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Default role ROLE_USER not found"));
            user.setRoles(Set.of(defaultRole));
        }
        userRepository.save(user);
    }

    @Override
    public void updateUser(User user) {
        User existingUser = getById(user.getId());

        existingUser.setName(user.getName());
        existingUser.setSurname(user.getSurname());
        existingUser.setAge(user.getAge());
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());

        // Сохраняем существующие роли пользователя
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            existingUser.setRoles(user.getRoles());
        }

        // Если пароль указан - обновляем его
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            existingUser.setPassword(user.getPassword());
        }

        userRepository.save(existingUser);
    }
}