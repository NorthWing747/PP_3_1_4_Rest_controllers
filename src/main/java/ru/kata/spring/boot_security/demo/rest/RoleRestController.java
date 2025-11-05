//package ru.kata.spring.boot_security.demo.rest;
//
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//import ru.kata.spring.boot_security.demo.entity.Role;
//import ru.kata.spring.boot_security.demo.service.RoleService;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/roles")
//public class RoleRestController {
//
//    private final RoleService roleService;
//
//    public RoleRestController(RoleService roleService) {
//        this.roleService = roleService;
//    }
//
//    @GetMapping
//    public List<Role> getAllRoles() {
//        return roleService.getAllRoles();
//    }
//}