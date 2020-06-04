import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    loginForm: FormGroup;
    isSubmitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) { }

    ngOnInit() {
        this.loginForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    async onLogin() {
        this.isSubmitted = true;
        if (this.loginForm.invalid) return;
        const userCredential: firebase.auth.UserCredential = await this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
        if (userCredential) this.router.navigate(['/tabs'])
    }
}
