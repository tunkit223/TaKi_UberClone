import { DriverStore, LocationStore, MarkerData } from '@/type/type'
import {create} from 'zustand'
export const useLocationStore = create<LocationStore>((set)=>({
  userAddress: null,
  userLongitude: null,
  userLatitude:null,
  destinationLongitude:null,
  destinationLatitude:null,
  destinationAddress:null,
  setUserLocation:({
    latitude,
    longitude, 
    address,
  }:{
    latitude:number,
    longitude:number,
    address:string,
  }) => {
    console.log("Setting user location:", latitude, longitude, address); // Thêm dòng này
      set(()=>({
        userLatitude: latitude,
        userLongitude: longitude,
        userAddress: address,
      }))
  },
  setDestinationLocation:({
    latitude,
    longitude, 
    address,
  }:{
    latitude:number,
    longitude:number,
    address:string,
  }) => {
      set(()=>({
        destinationLatitude: latitude,
        destinationLongitude: longitude,
        destinationAddress: address,
      }))
  },
}))

export const useDriverStore = create<DriverStore>((set)=>({
  drivers: [] as MarkerData[],
  selectedDriver:null,
  setSelectedDriver:(driverId:number) =>
    set(()=>({selectedDriver: driverId})),
  setDrivers: (drivers:MarkerData[]) => set(()=>({drivers:drivers})),
  clearSelectedDriver: ()=>set(()=>({selectedDriver:null}))
}))