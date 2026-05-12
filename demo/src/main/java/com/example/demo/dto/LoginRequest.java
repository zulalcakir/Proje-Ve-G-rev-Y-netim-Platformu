package com.example.demo.dto;

/**
 * Giriş isteklerini karşılamak için kullanılan veri taşıma objesi (DTO).
 * Beni Hatırla özelliği için rememberMe alanı eklenmiştir.
 */
public class LoginRequest {
    private String username;
    private String password;
    private boolean rememberMe; // YENİ: Kullanıcının oturumu uzatmak isteyip istemediğini tutar

    public LoginRequest() {}

    // --- GETTER VE SETTERLAR ---

    public String getUsername() { 
        return username; 
    }
    
    public void setUsername(String username) { 
        this.username = username; 
    }

    public String getPassword() { 
        return password; 
    }

    public void setPassword(String password) { 
        this.password = password; 
    }

    // YENİ: rememberMe için Getter
    public boolean isRememberMe() { 
        return rememberMe; 
    }

    // YENİ: rememberMe için Setter
    public void setRememberMe(boolean rememberMe) { 
        this.rememberMe = rememberMe; 
    }
}