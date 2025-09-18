import React from "react";
import { ImageSourcePropType, ViewStyle } from "react-native";
export declare enum DragMode {
    IMAGE = "image",
    SELECTION = "selection"
}
interface IImageCropProps {
    source: ImageSourcePropType;
    /** Width of source image - Required */
    imageWidth: number;
    /** Height of source image - Required */
    imageHeight: number;
    /** Width of cropping area*/
    initialCropBoxWidth?: number;
    /** Height of cropping area*/
    initialCropBoxHeight?: number;
    containerStyle?: ViewStyle;
    /** Enable circular selection. Setting to true will also
     * force the crop box to be a square */
    circular?: boolean;
    maxScale?: number;
    /** Default is false. If set, cropping box will always keep
     * an aspect ratio of cropBoxWidth / cropBoxHeight */
    fixedRatio?: boolean;
    /** Default is `DragMode.IMAGE` */
    dragMode?: DragMode;
    /** Customize styling on the crop box/circle */
    cropBoxStyle?: ViewStyle;
    zoomData?: {
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    };
}
export interface ImageCropRef {
    /** Gets and returns current crop offset, width and height as well as a
     * `zoomData` object that you can use to restore cropper state after unmounting
     * and re-visitng the cropper to adjust your crop */
    getCropData: () => ImageCropResponse;
}
export interface ImageCropResponse {
    offset: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    zoomData: {
        translateX: number;
        translateY: number;
        scale: number;
        currentZoomDistance: number;
    };
}
declare const ImageCrop: React.ForwardRefExoticComponent<IImageCropProps & React.RefAttributes<ImageCropRef>>;
export default ImageCrop;
