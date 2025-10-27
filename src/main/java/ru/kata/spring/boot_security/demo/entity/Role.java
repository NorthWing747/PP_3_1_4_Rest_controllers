package ru.kata.spring.boot_security.demo.entity;

import org.springframework.security.core.GrantedAuthority;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "roles")
public class Role implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    public Role() {}


    @Override
    public String getAuthority() {
        return name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // === equals/hashCode строго по id ===
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Role)) return false;
        Role that = (Role) o;
        // у новых (несохранённых) сущностей id = null => считаем их неравными
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        // у Hibernate есть рекомендация для прокси — фиксированный hashCode,
        // либо Objects.hash(id) если id гарантированно не null на персистентных
        return 31;
    }

    @Override
    public String toString() {
        return name;
    }
}