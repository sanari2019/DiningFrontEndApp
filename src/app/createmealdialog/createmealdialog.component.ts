import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FloatLabelType, MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AvailableMealService } from './available-meal.service';
import { AvailableMeal } from './availableMeal.model';
import { MealActivityService } from './meal-activity.service';
import { MealActivity } from './meal-activity.model';



@Component({
  selector: 'app-createmealdialog',
  templateUrl: './createmealdialog.component.html',
  styleUrls: ['./createmealdialog.component.scss']
})
export class CreatemealdialogComponent implements OnInit {
  mealForm!: FormGroup;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  options = this._formBuilder.group({
    hideRequired: this.hideRequiredControl,
    floatLabel: this.floatLabelControl,
  });


  constructor(private mealActivityService: MealActivityService, private availableMealService: AvailableMealService, private http: HttpClient, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<CreatemealdialogComponent>) {
    this.mealForm = this._formBuilder.group({
      image: [null, Validators.required],
      mealType: ['', Validators.required],
      mealName: ['', Validators.required],
      description: [''],
      active: [false],
    });

  }

  onSubmit() {
    if (this.mealForm.valid) {
      const formData = this.mealForm.value;
      const mealActivity = new MealActivity;
      const userJSON = localStorage.getItem('user');
      const user = JSON.parse(userJSON || '[]');



      this.availableMealService.createAvailableMeal(formData).subscribe(
        (result: AvailableMeal) => {
          // Handle the response, e.g., show a success message or redirect to another page
          if (result.active === true) {
            this.mealActivityService.createMealActivity(mealActivity).subscribe(() => {
              mealActivity.availableMealId = result.id;
              mealActivity.madeActiveDate = result.dateCreated;
              mealActivity.madeActiveBy = user.id;
              mealActivity.madeInactiveDate = new Date('01-01-2001');
              mealActivity.madeInactiveBy = '';

            })
          }
          console.log('Meal created:', result);
          this.dialogRef.close();
        },
        (error: any) => {
          // Handle errors, e.g., show an error message
          console.error('Error creating meal:', error);
        }
      );
    }
  }


  ngOnInit(): void {
  }

  getFloatLabelValue(): FloatLabelType {
    return this.floatLabelControl.value || 'auto';
  }
  onCloseClick(): void {
    this.dialogRef.close();
  }

  fileInfo!: string;

  /**
   * Called when the value of the file input changes, i.e. when a file has been
   * selected for upload.
   *
   * @param input the file input HTMLElement
   */
  onFileSelect(input: HTMLInputElement): void {

    /**
     * Format the size to a human readable string
     *
     * @param bytes
     * @returns the formatted string e.g. `105 kB` or 25.6 MB
     */
    function formatBytes(bytes: number): string {
      const UNITS = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const factor = 1024;
      let index = 0;

      while (bytes >= factor) {
        bytes /= factor;
        index++;
      }

      return `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`;
    }

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileInfo = `${file.name} (${formatBytes(file.size)}`;
    } else {
      // Handle the case when no file is selected
      this.fileInfo = 'No file selected';
    }
  }


}
