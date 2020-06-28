import { UtilsService } from "./utils.service";
import { AuthService } from "./auth.service";
import { PetModel } from "./../schemes/models/pet.model";
import { PetProvider } from "./../providers/pet.provider";
import { Plugins } from "@capacitor/core";
import { Injectable } from "@angular/core";
import { take } from "rxjs/operators";

const { Geolocation } = Plugins;

@Injectable({
  providedIn: "root",
})
export class GeolocationService {
  watch: string = null;
  petId: string = null;
  tracking: boolean = false;
  advertised = false;

  constructor(
    private petProvider: PetProvider,
    private authService: AuthService,
    private utilsService: UtilsService
  ) {}

  async startTrackingLocation() {
    this.petId = await this.authService.getCurrentUserUid();
    this.tracking = true;
    const permissions = await Geolocation.requestPermissions().catch(
      (err) => null
    );
    if (permissions == null) {
      await this.petProvider
        .updatePetLocation(this.petId, { ubication: null })
        .catch((_) => {});
    } else {
      this.watch = Geolocation.watchPosition(
        { enableHighAccuracy: true },
        async (position, err) => {
          if (position) {
            this.petProvider
              .updatePetLocation(this.petId, {
                ubication: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
              })
              .catch((_) => {
                console.log("Error al actualizar la ubicacion");
              });
          } else {
            await Geolocation.clearWatch({ id: this.watch })
            .then(async () => {
              this.tracking = false;
            })
            .catch((err) => {
              console.log(err);
            });
            if (!this.advertised) {
              this.utilsService.showToast(
                "Ubicacion no disponible, revise " +
                  "que tenga la ubicación del dispositivo activada, se usará la ultima ubicación registrada"
              );
              this.advertised = true;
            }
            await this.startTrackingLocation();
          }
        }
      );
    }
  }

  async getCurrentLocation() {
    this.petId = await this.authService.getCurrentUserUid();
    const permissions = await Geolocation.requestPermissions().catch(
      (err) => null
    );
    if (permissions == null) {
      await this.petProvider
        .updatePetLocation(this.petId, { ubication: null })
        .catch((_) => {});
    } else {
      return Geolocation.getCurrentPosition();
    }
  }

  async stopTrackingLocation() {
    await Geolocation.clearWatch({ id: this.watch })
      .then(async () => {
        await this.petProvider
          .updatePetLocation(this.petId, { ubication: null })
          .catch((_) => {
            console.log("Problema al updatear localizacion");
          });
        this.tracking = false;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async stopTrackingWithoutNullValue() {
    this.advertised = false;
    return Geolocation.clearWatch({ id: this.watch })
      .then(async () => {
        this.tracking = false;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getTrackingState(): boolean {
    return this.tracking;
  }
}
