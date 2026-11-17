
package csd230.lab1.controllers;

import csd230.lab1.auth.JwtUtil;
import csd230.lab1.dtos.requests.LoginReq;
import csd230.lab1.dtos.responses.ErrorRes;
import csd230.lab1.dtos.responses.LoginRes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rest/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq loginReq) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginReq.getUsername(),
                            loginReq.getPassword()
                    )
            );

            String username = authentication.getName();

            String token = jwtUtil.createToken(
                    username,
                    authentication.getAuthorities()
            );

            return ResponseEntity.ok(new LoginRes(username, token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorRes(
                            HttpStatus.BAD_REQUEST,
                            "Invalid username or password"
                    ));
        }
    }
}
