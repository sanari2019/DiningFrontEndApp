import { Component, OnInit } from '@angular/core';
import { Registration } from '../registration/registration.model';
import { Observable, of } from 'rxjs';
import { RegistrationService } from '../registration/registration.service';
import { UserService } from '../forgot-password/user.service';
import { catchError, map } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
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
  }; // Initialize an empty user object
  freezeStatus: boolean = false;
  autolockStatus: boolean = false;


  constructor(
    private regservice: RegistrationService, private userService: UserService
  ) { }
  ngOnInit(): void {
    const userObject = JSON.parse(localStorage.getItem('user') || '{}');
    if (userObject.id) {
      const userId = userObject.id;

      // Now you have the userId, you can use it wherever you need
      // For example, you can call the `getUser` method with the userId
      this.getUser(userId);

    }
    this.checkFreezeStatus().subscribe((freezeStatus: boolean) => {
      this.freezeStatus = freezeStatus; // Set the freezeStatus variable to the retrieved value
    });
    this.checkAutolockStatus().subscribe((autolockStatus: boolean) => {
      this.autolockStatus = autolockStatus; // Set the freezeStatus variable to the retrieved value
    });
  }
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
  checkAutolockStatus(): Observable<boolean> {
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
  toggleAutolockStatus(event: MatSlideToggleChange): void {
    const newStatus = event.checked; // Get the new status from the toggle event

    // Update the freezeStatus variable
    this.autolockStatus = newStatus;

    // Update the freeze status in your user object
    this.user.autolock = newStatus;

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


}
