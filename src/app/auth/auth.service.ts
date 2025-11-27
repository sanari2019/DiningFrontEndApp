import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Registration } from '../registration/registration.model';
import { RegistrationService } from '../registration/registration.service';
import { EncrDecrService } from '../shared/EncrDecrService.service';
import { UserService } from '../forgot-password/user.service';
import { catchError, map } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';



@Injectable()
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.checkInitialLoginStatus());
  public notLoggedIn = new BehaviorSubject<boolean>(false);
  public registration: Registration | undefined;
  private pswrd?: string;
  public loginuser: Registration | undefined;
  logoutTimer: any;
  user: Registration = {
    id: 0,
    custTypeId: 0,
    custId: '',
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    freeze: false,
    autolock: false
  };
  freezeStatus: boolean = false;

  /**
   * Check initial login status from localStorage on service initialization
   */
  private checkInitialLoginStatus(): boolean {
    // Check for JWT token first (from AuthNewService)
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      // Also restore registration from user_data
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.registration = {
            id: user.id,
            custTypeId: user.custTypeId,
            custId: user.custId,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            password: '',
            freeze: user.freeze || false,
            autolock: false
          };
        } catch (e) {
          console.error('Error parsing user_data:', e);
        }
      }
      return true;
    }

    // Fallback to old auth method
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const userObject = JSON.parse(userString);
          if (userObject && userObject.id) {
            this.registration = userObject;
            return true;
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }

    return false;
  }

  get isLoggedIn(): Observable<boolean> {
    // Check for JWT token first
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      // Restore registration if not set
      if (!this.registration) {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            this.registration = {
              id: user.id,
              custTypeId: user.custTypeId,
              custId: user.custId,
              firstName: user.firstName,
              lastName: user.lastName,
              userName: user.userName,
              password: '',
              freeze: user.freeze || false,
              autolock: false
            };
          } catch (e) {
            console.error('Error parsing user_data:', e);
          }
        }
      }
      this.loggedIn.next(true);
      return of(true);
    }

    // Fallback to old auth method
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const userObject = JSON.parse(userString);
          if (userObject && userObject.id) {
            if (!this.registration) {
              this.registration = userObject;
            }
            this.loggedIn.next(true);
            return of(true);
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }

    return this.loggedIn.asObservable();
  }

  /**
   * Trigger authentication state change - call after successful login from AuthNewService
   */
  notifyLoginSuccess(): void {
    this.loggedIn.next(true);
  }


  constructor(
    private router: Router, private regservice: RegistrationService, private encservice: EncrDecrService, private userService: UserService
  ) { }

  getUser(userId: number): Observable<boolean> {
    return this.regservice.getUser(userId).pipe(
      map((user: Registration) => {
        if (user && user.freeze) {
          this.user = user;
          this.freezeStatus = user.freeze;
          return user.freeze;
        }
        return false;
      }),
      catchError((error) => {
        console.error('Error fetching user:', error);
        return of(false); // Return a default value (false) in case of an error
      })
    );
  }

  checkFreezeStatus(): Observable<boolean> {
    const userObject = JSON.parse(localStorage.getItem('user') || '{}');
    this.user = userObject;
    return this.getUser(this.user.id);
  }
  toggleFreezeStatus(event: MatSlideToggleChange): void {
    const newStatus = event.checked; // Get the new status from the toggle event

    // Update the freezeStatus variable
    this.freezeStatus = newStatus;

    // Update the freeze status in your user object
    this.user.freeze = newStatus;

    // Update the user's freeze status via the service
    this.regservice.updateUser(this.user).subscribe(
      (updatedUser: Registration) => {
        console.log('Freeze status updated successfully:', updatedUser);
        // Handle success if needed
      },
      (error) => {
        console.error('Error updating freeze status:', error);
        // Handle error if the update fails
      }
    );

    this.updateUserInLocalStorage(this.user);
  }
  updateUserInLocalStorage(updatedUser: any): void {
    // Retrieve the existing user data from local storage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Merge the updated fields with the existing user data
    const updatedUserData = { ...currentUser, ...updatedUser };

    // Update the 'user' key in local storage with the updated user data
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  }


  //   login(reg: Registration): Number{

  //   //  let result=0;
  //    if(reg.userName!==undefined){
  //     this.loginuser=reg;
  //     this.getUser(reg.userName)
  //     if(this.registration!==undefined){
  //       this.result=2;
  //     }
  //     else{
  //       this.result=1;
  //     }

  //   }
  //    return this.result;
  // }


  // login(reg: Registration) {
  //   let result = 0;
  //   if (reg.userName !== undefined) {
  //     this.regservice.getUserbyusername(reg.userName)
  //       .subscribe((rlst: Registration) => {
  //         // if(this.loginuser!==undefined){
  //         this.registration = rlst;
  //         this.pswrd = this.encservice.set('123456$#@$^@1ERF', reg.password);
  //         if (reg.userName === this.registration?.userName && this.pswrd === this.registration?.password) {
  //           this.loggedIn.next(true);
  //           localStorage.setItem('user', JSON.stringify(this.registration));
  //           this.router.navigate(['/']);
  //           result = 2;
  //           this.notLoggedIn.next(true);
  //         } if (reg.userName === this.registration?.userName && this.pswrd !== this.registration?.password) {
  //           result = 1;
  //           this.notLoggedIn.next(false);
  //           console.log("Incorrect Password");
  //         }
  //         else {
  //           result = 1;
  //           this.notLoggedIn.next(false);
  //           console.log("Username or Password incorrect");
  //         }
  //         // }
  //       });
  //   }
  //   // return this.notLoggedIn;
  // }
  login(reg: Registration): Observable<string> {
    const userObject = JSON.parse(localStorage.getItem('user') || '{}');
    return new Observable<string>((observer) => {
      if (reg.userName !== undefined) {
        this.regservice.getUserbyusername(reg.userName)
          .subscribe((rlst: Registration) => {
            this.registration = rlst;
            this.pswrd = this.encservice.set('123456$#@$^@1ERF', reg.password);
            if (reg.userName === this.registration?.userName && this.pswrd === this.registration?.password) {
              this.loggedIn.next(true);
              localStorage.setItem('user', JSON.stringify(this.registration));
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('loginTime', Date.now().toString());
              localStorage.getItem('user') || '{}';
              const userObject = JSON.parse(localStorage.getItem('user') || '{}');
              if (userObject.id) {
                const userId = userObject.id;

                // Now you have the userId, you can use it wherever you need
                // For example, you can call the `getUser` method with the userId
                this.getUser(userId);

              }


              // this.startLogoutTimer();
              this.notLoggedIn.next(true);
              observer.next(""); // Emit an empty string for successful login.
              this.router.navigate(['/']);
            } else if (reg.userName === this.registration?.userName && this.pswrd !== this.registration?.password) {
              this.notLoggedIn.next(false);
              console.log("Incorrect Password");
              observer.next("Incorrect Password"); // Emit the error message for incorrect password.
            } else {
              this.notLoggedIn.next(false);
              console.log("Username or Password incorrect");
              observer.next("Username does not exist"); // Emit the error message for invalid username or password.
            }
            observer.complete();
          });
      } else {
        observer.complete();
      }
    });


  }

  // Start the logout timer
  startLogoutTimer() {
    const timeout = 15 * 60 * 1000; // 15 minutes in milliseconds

    this.logoutTimer = setTimeout(() => {
      this.logout(); // Logout function in AuthService
    }, timeout);
  }

  // Reset the logout timer on user activity
  resetLogoutTimer() {
    clearTimeout(this.logoutTimer);
    this.startLogoutTimer();
  }


  logout() {
    this.loggedIn.next(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    // clearTimeout(this.logoutTimer);
    this.router.navigate(['/login']);
  }
}
