package com.example.backend.service;

import com.example.backend.dto.CategoryDto;
import com.example.backend.model.Category;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;

    public List<CategoryDto> getAllCategories() {
        log.debug("Getting all categories");
        try {
            List<Category> allCategories = categoryRepository.findAll();
            log.debug("Found {} categories in database", allCategories.size());
            
            if (allCategories.isEmpty()) {
                log.info("No categories found in database, returning empty list");
                return new ArrayList<>();
            }
            
            List<CategoryDto> categories = allCategories.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            log.debug("Converted {} categories to DTOs", categories.size());
            return categories;
        } catch (Exception e) {
            log.error("Error getting categories: ", e);
            throw new RuntimeException("Failed to retrieve categories: " + e.getMessage(), e);
        }
    }

    @Cacheable(value = "categories", key = "#id")
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        category.setIcon(categoryDto.getIcon());
        category = categoryRepository.save(category);
        return convertToDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        category.setIcon(categoryDto.getIcon());
        category = categoryRepository.save(category);
        return convertToDto(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setIcon(category.getIcon());
        try {
            dto.setServiceCount((long) serviceRepository.findByCategoryIdAndActiveTrue(category.getId()).size());
        } catch (Exception e) {
            log.warn("Error counting services for category {}: {}", category.getId(), e.getMessage());
           
            dto.setServiceCount(0L);
        }
        return dto;
    }
}




