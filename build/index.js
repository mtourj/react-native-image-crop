"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragMode = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const styles_1 = __importDefault(require("./styles"));
const util_1 = require("./util");
var DragMode;
(function (DragMode) {
    DragMode["IMAGE"] = "image";
    DragMode["SELECTION"] = "selection";
})(DragMode || (exports.DragMode = DragMode = {}));
const MIN_SCALE = 0.5;
const DEFAULT_MAX_SCALE = 3;
const DEFAULT_CROP_SIZE = 350;
const MINIMUM_IMAGE_SIZE = 80;
const ImageCrop = (0, react_1.forwardRef)((props, ref) => {
    var _a, _b, _c;
    let initialCropBoxWidth = (_a = props.initialCropBoxWidth) !== null && _a !== void 0 ? _a : DEFAULT_CROP_SIZE * (props.imageWidth / DEFAULT_CROP_SIZE);
    let initialCropBoxHeight = (_b = props.initialCropBoxHeight) !== null && _b !== void 0 ? _b : DEFAULT_CROP_SIZE * (props.imageHeight / DEFAULT_CROP_SIZE);
    /** Force the crop box to be a square if `circular` is set */
    if (props.circular) {
        const largerSide = Math.max(initialCropBoxHeight, initialCropBoxWidth);
        initialCropBoxHeight = largerSide;
        initialCropBoxWidth = largerSide;
    }
    const maxScale = (_c = props.maxScale) !== null && _c !== void 0 ? _c : DEFAULT_MAX_SCALE;
    /** Rendered width & height of image (at scale of 1) */
    const [_imageWidth, setImageWidth] = (0, react_1.useState)(0);
    const [_imageHeight, setImageHeight] = (0, react_1.useState)(0);
    const imageWidthRef = (0, react_1.useRef)(_imageWidth);
    const imageHeightRef = (0, react_1.useRef)(_imageHeight);
    const imageDiagonal = (0, react_1.useRef)(0);
    // For for animating automated cropbox re-centers
    const viewportOffset = (0, react_1.useRef)(new react_native_1.Animated.ValueXY({ x: 0, y: 0 }));
    const isCropBoxMoving = (0, react_1.useRef)(false);
    const topEdgeActivityIndicatorScale = (0, react_1.useRef)(new react_native_1.Animated.Value(0));
    const bottomEdgeActivityIndicatorScale = (0, react_1.useRef)(new react_native_1.Animated.Value(0));
    const rightEdgeActivityIndicatorScale = (0, react_1.useRef)(new react_native_1.Animated.Value(0));
    const leftEdgeActivityIndicatorScale = (0, react_1.useRef)(new react_native_1.Animated.Value(0));
    const imageOffsetX = (0, react_1.useRef)(0);
    const imageOffsetY = (0, react_1.useRef)(0);
    const animatedImageOffset = (0, react_1.useRef)(new react_native_1.Animated.ValueXY({ x: 0, y: 0 }));
    const animatedOverflowImageOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0.4));
    const cropBoxPosition = (0, react_1.useRef)({
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
    });
    const animatedCropBoxPosition = (0, react_1.useRef)({
        top: new react_native_1.Animated.Value(0),
        bottom: new react_native_1.Animated.Value(0),
        right: new react_native_1.Animated.Value(0),
        left: new react_native_1.Animated.Value(0),
    });
    const cropBoxImageOffset = (0, react_1.useRef)(new react_native_1.Animated.ValueXY({ x: 0, y: 0 }));
    function getCropBoxWidth() {
        return (imageWidthRef.current -
            cropBoxPosition.current.left -
            cropBoxPosition.current.right);
    }
    function getCropBoxHeight() {
        return (imageHeightRef.current -
            cropBoxPosition.current.top -
            cropBoxPosition.current.bottom);
    }
    const scale = (0, react_1.useRef)(1);
    const animatedScale = (0, react_1.useRef)(new react_native_1.Animated.Value(scale.current));
    /** Gesture context */
    const lastZoomDistance = (0, react_1.useRef)();
    const zoomDistance = (0, react_1.useRef)(1);
    const lastGestureDx = (0, react_1.useRef)(0);
    const lastGestureDy = (0, react_1.useRef)(0);
    const panResponders = (0, react_1.useRef)({});
    (0, react_1.useEffect)(() => {
        imageWidthRef.current = _imageWidth;
    }, [_imageWidth]);
    (0, react_1.useEffect)(() => {
        imageHeightRef.current = _imageHeight;
    }, [_imageHeight]);
    // useEffect(() => {
    //   if (isDragging) {
    //     Animated.timing(animatedOverflowImageOpacity.current, {
    //       toValue: 0.7,
    //       useNativeDriver: true,
    //       duration: 100,
    //       easing: Easing.out(Easing.poly(4)),
    //     }).start();
    //   } else {
    //     Animated.timing(animatedOverflowImageOpacity.current, {
    //       toValue: 0.4,
    //       useNativeDriver: true,
    //       duration: 140,
    //       easing: Easing.out(Easing.poly(4)),
    //     }).start();
    //   }
    // }, [isDragging]);
    (0, react_1.useEffect)(function calibrate() {
        // Calibrate internal dimensions based on provided dimensions
        const cropBoxRatio = initialCropBoxWidth / initialCropBoxHeight;
        const imageRatio = props.imageWidth / props.imageHeight;
        let width;
        let height;
        if (props.imageWidth < props.imageHeight) {
            if (cropBoxRatio >= 1) {
                width = initialCropBoxWidth;
                height = (initialCropBoxHeight / imageRatio) * cropBoxRatio;
            }
            else {
                width = (initialCropBoxWidth * imageRatio) / cropBoxRatio;
                height = initialCropBoxHeight;
            }
        }
        else {
            if (cropBoxRatio > 1) {
                width = initialCropBoxWidth;
                height = (initialCropBoxHeight / imageRatio) * cropBoxRatio;
            }
            else {
                width = (initialCropBoxWidth * imageRatio) / cropBoxRatio;
                height = initialCropBoxHeight;
            }
        }
        // if (cropBoxRatio > 1) {
        //   height = cropBoxRatio * height;
        // } else {
        //   width = cropBoxRatio * width;
        // }
        setImageWidth(width);
        setImageHeight(height);
        // Immediate update refs because they will be used by resizeCropBox() before useEffect can update them
        imageWidthRef.current = width;
        imageHeightRef.current = height;
        // Get crop box offset so that it matches the provided initialCropBoxWidth/Height
        let offsetX = Math.max(width - initialCropBoxWidth, 0);
        let offsetY = Math.max(height - initialCropBoxHeight, 0);
        cropBoxPosition.current.top = offsetY / 2;
        cropBoxPosition.current.bottom = offsetY / 2;
        cropBoxPosition.current.right = offsetX / 2;
        cropBoxPosition.current.left = offsetX / 2;
        resizeCropBox();
        // Get diagonal size
        imageDiagonal.current = Math.floor(Math.sqrt(Math.pow(imageWidthRef.current, 2) +
            Math.pow(imageHeightRef.current, 2)));
    }, [
        props.imageWidth,
        props.imageHeight,
        props.initialCropBoxHeight,
        props.initialCropBoxWidth,
    ]);
    const imageDragAndPinchResponder = (0, react_1.useMemo)(() => {
        return react_native_1.PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return !isCropBoxMoving.current;
            },
            onPanResponderGrant: () => {
                lastZoomDistance.current = undefined;
                lastGestureDx.current = 0;
                lastGestureDy.current = 0;
            },
            onPanResponderMove: (event, gestureState) => {
                const { changedTouches } = event.nativeEvent;
                if (changedTouches.length <= 1) {
                    // Handle drag
                    switch (props.dragMode) {
                        case DragMode.SELECTION: {
                            const incrementDx = lastGestureDx.current === null
                                ? 0
                                : gestureState.dx - lastGestureDx.current;
                            const incrementDy = lastGestureDy.current === null
                                ? 0
                                : gestureState.dy - lastGestureDy.current;
                            // Set cropBoxPosition and call calculateCropBoxPosition()
                            // to get the position with constraints applied to it
                            cropBoxPosition.current.bottom -= incrementDy;
                            cropBoxPosition.current.top += incrementDy;
                            cropBoxPosition.current.left += incrementDx;
                            cropBoxPosition.current.right -= incrementDx;
                            const newPosition = calculateCropBoxPosition(true);
                            cropBoxPosition.current.bottom = newPosition.bottom;
                            cropBoxPosition.current.top = newPosition.top;
                            cropBoxPosition.current.left = newPosition.left;
                            cropBoxPosition.current.right = newPosition.right;
                            resizeCropBox();
                            break;
                        }
                        case DragMode.IMAGE:
                        default: {
                            imageOffsetX.current +=
                                lastGestureDx.current === null
                                    ? 0
                                    : (gestureState.dx - lastGestureDx.current) / scale.current;
                            imageOffsetY.current +=
                                lastGestureDy.current === null
                                    ? 0
                                    : (gestureState.dy - lastGestureDy.current) / scale.current;
                        }
                    }
                }
                else {
                    // Handle zoom
                    const widthDistance = changedTouches[1].pageX - changedTouches[0].pageX;
                    const heightDistance = changedTouches[1].pageY - changedTouches[0].pageY;
                    zoomDistance.current = Math.floor(Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance));
                    if (lastZoomDistance.current) {
                        let newScale = scale.current +
                            (((zoomDistance.current - lastZoomDistance.current) *
                                scale.current) /
                                imageDiagonal.current) *
                                2;
                        if (newScale < MIN_SCALE) {
                            newScale = MIN_SCALE;
                        }
                        else if (newScale > maxScale) {
                            newScale = maxScale;
                        }
                        animatedScale.current.setValue(newScale);
                        scale.current = newScale;
                    }
                    // Changing scale might cause us to go outside our translation constraints,
                    // so we call translateImage() to make sure we stay within them
                    lastZoomDistance.current = zoomDistance.current;
                    resizeCropBox();
                }
                lastGestureDx.current = gestureState.dx;
                lastGestureDy.current = gestureState.dy;
                translateImage();
            },
            onPanResponderEnd: () => { },
            onPanResponderTerminationRequest: (e, gestureState) => {
                return false;
            },
            onPanResponderTerminate: () => {
                // console.log("TERMINATED");
            },
        });
    }, []);
    const getEdgeCropHandlePanResponder = (position) => {
        if (!panResponders.current[position])
            panResponders.current[position] = react_native_1.PanResponder.create({
                onStartShouldSetPanResponder: () => {
                    // If fixedRatio is enabled, do not respond to edge movement
                    return (!isCropBoxMoving.current && !props.circular && !props.fixedRatio);
                },
                onPanResponderGrant: () => {
                    lastGestureDx.current = 0;
                    lastGestureDy.current = 0;
                    animateActiveEdgeStart(position);
                },
                onPanResponderMove: (event, gestureState) => {
                    let shouldInvert = position === "right" || position === "bottom";
                    let offset = position === "left" || position === "right"
                        ? gestureState.dx
                        : gestureState.dy;
                    let lastGesture = position === "left" || position === "right"
                        ? lastGestureDx.current
                        : lastGestureDy.current;
                    cropBoxPosition.current[position] += lastGesture
                        ? (offset - lastGesture) * (shouldInvert ? -1 : 1)
                        : 0;
                    lastGestureDx.current = gestureState.dx;
                    lastGestureDy.current = gestureState.dy;
                    resizeCropBox();
                },
                onPanResponderEnd: () => {
                    recenterCropBox();
                    animateActiveEdgeEnd(position);
                },
                onPanResponderTerminate: () => {
                    recenterCropBox();
                    animateActiveEdgeEnd(position);
                },
            });
        return panResponders.current[position];
    };
    const getCornerCropHandlePanResponder = (position) => {
        if (!panResponders.current[position])
            panResponders.current[position] = react_native_1.PanResponder.create({
                onStartShouldSetPanResponder: () => {
                    return !isCropBoxMoving.current;
                },
                onPanResponderGrant: () => {
                    lastGestureDx.current = 0;
                    lastGestureDy.current = 0;
                },
                onPanResponderMove: (event, gestureState) => {
                    let incrementDx = lastGestureDx.current
                        ? gestureState.dx - lastGestureDx.current
                        : 0;
                    let incrementDy = lastGestureDy.current
                        ? gestureState.dy - lastGestureDy.current
                        : 0;
                    if (props.fixedRatio) {
                        let ratioX = getCropBoxWidth() / getCropBoxHeight();
                        let ratioY = 1 / ratioX;
                        if (ratioX < 1)
                            ratioX = 1;
                        if (ratioY < 1)
                            ratioY = 1;
                        let movementX = position === "top-right" || position === "bottom-right"
                            ? incrementDx * -1
                            : incrementDx;
                        let movementY = position === "bottom-right" || position === "bottom-left"
                            ? incrementDy * -1
                            : incrementDy;
                        // get diagonal distance and direction
                        const incrementDdirection = movementX + movementY > 0 ? 1 : 0;
                        const incrementDd = Math.floor(Math.sqrt(Math.pow(incrementDx, 2) + Math.pow(incrementDy, 2))) / Math.sqrt(2);
                        let multiplier = 1;
                        if (incrementDdirection === 0)
                            multiplier *= -1;
                        incrementDx = (incrementDd / ratioY) * multiplier;
                        incrementDy = (incrementDd / ratioX) * multiplier;
                        if (position === "top-right" || position === "bottom-right")
                            incrementDx *= -1;
                        if (position === "bottom-left" || position === "bottom-right")
                            incrementDy *= -1;
                    }
                    if (position === "top-left" || position === "top-right") {
                        cropBoxPosition.current.top += incrementDy;
                    }
                    if (position === "top-left" || position === "bottom-left") {
                        cropBoxPosition.current.left += incrementDx;
                    }
                    if (position === "top-right" || position === "bottom-right") {
                        cropBoxPosition.current.right -= incrementDx;
                    }
                    if (position === "bottom-left" || position === "bottom-right") {
                        cropBoxPosition.current.bottom -= incrementDy;
                    }
                    lastGestureDx.current = gestureState.dx;
                    lastGestureDy.current = gestureState.dy;
                    resizeCropBox();
                },
                onPanResponderEnd: () => {
                    recenterCropBox();
                },
                onPanResponderTerminate: () => {
                    recenterCropBox();
                },
            });
        return panResponders.current[position];
    };
    function recenterCropBox() {
        if (props.dragMode !== DragMode.IMAGE)
            return;
        isCropBoxMoving.current = true;
        const cropBoxWidth = getCropBoxWidth();
        const cropBoxHeight = getCropBoxHeight();
        const centeredPosition = {
            left: (imageWidthRef.current - cropBoxWidth) / 2,
            right: (imageWidthRef.current - cropBoxWidth) / 2,
            top: (imageHeightRef.current - cropBoxHeight) / 2,
            bottom: (imageHeightRef.current - cropBoxHeight) / 2,
        };
        const changeAmount = {
            left: centeredPosition.left - cropBoxPosition.current.left,
            right: centeredPosition.right - cropBoxPosition.current.right,
            top: centeredPosition.top - cropBoxPosition.current.top,
            bottom: centeredPosition.bottom - cropBoxPosition.current.bottom,
        };
        // TODO: Include scale
        // if(cropBoxWidth > cropBoxHeight) {
        //   // Scale to match original width
        // } else {
        // }
        cropBoxPosition.current = centeredPosition;
        animatedCropBoxPosition.current.bottom.setValue(centeredPosition.bottom);
        animatedCropBoxPosition.current.top.setValue(centeredPosition.top);
        animatedCropBoxPosition.current.left.setValue(centeredPosition.left);
        animatedCropBoxPosition.current.right.setValue(centeredPosition.right);
        imageOffsetX.current += changeAmount.left / scale.current;
        imageOffsetY.current += changeAmount.top / scale.current;
        animatedImageOffset.current.setValue({
            x: imageOffsetX.current,
            y: imageOffsetY.current,
        });
        viewportOffset.current.setValue({
            x: -changeAmount.left,
            y: -changeAmount.top,
        });
        // translateImage();
        resizeCropBox();
        react_native_1.Animated.timing(viewportOffset.current, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            duration: 500,
            easing: react_native_1.Easing.out(react_native_1.Easing.poly(4)),
        }).start(() => {
            isCropBoxMoving.current = false;
        });
    }
    function translateImage() {
        const maxOffsetX = (imageWidthRef.current - getCropBoxWidth() / scale.current) / 2;
        const minOffsetX = -(imageWidthRef.current - getCropBoxWidth() / scale.current) / 2;
        const maxOffsetY = (imageHeightRef.current - getCropBoxHeight() / scale.current) / 2;
        const minOffsetY = -(imageHeightRef.current - getCropBoxHeight() / scale.current) / 2;
        if (imageOffsetX.current > maxOffsetX) {
            imageOffsetX.current = maxOffsetX;
        }
        if (imageOffsetX.current < minOffsetX) {
            imageOffsetX.current = minOffsetX;
        }
        if (imageOffsetY.current > maxOffsetY) {
            imageOffsetY.current = maxOffsetY;
        }
        if (imageOffsetY.current < minOffsetY) {
            imageOffsetY.current = minOffsetY;
        }
        animatedImageOffset.current.setValue({
            x: imageOffsetX.current,
            y: imageOffsetY.current,
        });
    }
    function calculateCropBoxPosition(preventResize) {
        let calculatedPosition = {};
        let minValues = {};
        let maxValues = {};
        // Using this to override values at the end of execution before returning results
        let overridePosition = {};
        for (let position of Object.keys(cropBoxPosition.current)) {
            let value = cropBoxPosition.current[position];
            let minValue;
            let maxValue;
            // Effect of scale
            if (position === "top") {
                minValue =
                    -(scale.current * imageHeightRef.current - imageHeightRef.current) /
                        2;
                maxValue =
                    imageHeightRef.current +
                        (scale.current * imageHeightRef.current - imageHeightRef.current) /
                            2 -
                        MINIMUM_IMAGE_SIZE;
            }
            else if (position === "left") {
                minValue =
                    -(scale.current * imageWidthRef.current - imageWidthRef.current) /
                        2;
                maxValue =
                    imageWidthRef.current +
                        (scale.current * imageWidthRef.current - imageWidthRef.current) /
                            2 -
                        MINIMUM_IMAGE_SIZE;
            }
            else if (position === "bottom") {
                minValue =
                    -(imageHeightRef.current * scale.current - imageHeightRef.current) /
                        2;
                maxValue =
                    imageHeightRef.current +
                        (scale.current * imageHeightRef.current - imageHeightRef.current) /
                            2 -
                        MINIMUM_IMAGE_SIZE;
            }
            else {
                // "right"
                minValue =
                    -(imageWidthRef.current * scale.current - imageWidthRef.current) /
                        2;
                maxValue =
                    imageWidthRef.current +
                        (scale.current * imageWidthRef.current - imageWidthRef.current) /
                            2 -
                        MINIMUM_IMAGE_SIZE;
            }
            // Effect of offset
            if (position === "top") {
                minValue += imageOffsetY.current * scale.current;
                maxValue += imageOffsetY.current * scale.current;
            }
            else if (position === "bottom") {
                maxValue -= imageOffsetY.current * scale.current;
                minValue -= imageOffsetY.current * scale.current;
            }
            else if (position === "left") {
                minValue += imageOffsetX.current * scale.current;
                maxValue += imageOffsetX.current * scale.current;
            }
            else if (position === "right") {
                minValue -= imageOffsetX.current * scale.current;
                maxValue -= imageOffsetX.current * scale.current;
            }
            // When dragMode is set to IMAGE, don't allow the crop box to go out of bounds
            if (props.dragMode === DragMode.IMAGE)
                minValue = 0;
            // Effect of opposite edge
            let oppositePosition;
            let imageSize;
            switch (position) {
                case "top": {
                    imageSize = imageHeightRef.current;
                    oppositePosition = cropBoxPosition.current.bottom;
                    break;
                }
                case "bottom": {
                    imageSize = imageHeightRef.current;
                    oppositePosition = cropBoxPosition.current.top;
                    break;
                }
                case "right": {
                    imageSize = imageWidthRef.current;
                    oppositePosition = cropBoxPosition.current.left;
                    break;
                }
                default:
                case "left": {
                    imageSize = imageWidthRef.current;
                    oppositePosition = cropBoxPosition.current.right;
                    break;
                }
            }
            maxValue = Math.min(imageSize - oppositePosition - MINIMUM_IMAGE_SIZE, maxValue);
            // Store calculated minimum and maximum values for later use
            minValues[position] = minValue;
            maxValues[position] = maxValue;
            // If we have `fixedRatio` or `circular` set and we are out of bounds, that means
            // we do not want to move at all, so we can just return the original position
            if ((props.fixedRatio || props.circular) &&
                (value < minValue || value > maxValue)) {
                return {
                    // @ts-ignore
                    top: animatedCropBoxPosition.current.top.__getValue(),
                    // @ts-ignore
                    bottom: animatedCropBoxPosition.current.bottom.__getValue(),
                    // @ts-ignore
                    right: animatedCropBoxPosition.current.right.__getValue(),
                    // @ts-ignore
                    left: animatedCropBoxPosition.current.left.__getValue(),
                };
            }
            // Clamp to constraints
            if (value < minValue) {
                value = minValue;
            }
            else if (value > maxValue) {
                value = maxValue;
            }
            calculatedPosition[position] = value;
        }
        if (preventResize || props.circular) {
            const cropBoxWidth = imageWidthRef.current -
                cropBoxPosition.current.left -
                cropBoxPosition.current.right;
            const cropBoxHeight = imageHeightRef.current -
                cropBoxPosition.current.top -
                cropBoxPosition.current.bottom;
            // Make sure that the crop box keeps its dimensions when dragged to the edges
            for (let position in calculatedPosition) {
                const value = calculatedPosition[position];
                const minValue = minValues[position];
                // For every edge of the crop box, check if we are at minimum value, and if we
                // are clamp the offset of the opposite edge to maintain resize of the crop box
                if (value === minValue) {
                    // Get the minimum value of the opposite side if we are to preserve current size
                    const oppositeMaxValueX = imageWidthRef.current +
                        (imageWidthRef.current * scale.current - imageWidthRef.current) /
                            2 -
                        cropBoxWidth;
                    const oppositeMaxValueY = imageHeightRef.current +
                        (imageHeightRef.current * scale.current -
                            imageHeightRef.current) /
                            2 -
                        cropBoxHeight;
                    if (position === "left" &&
                        calculatedPosition["right"] > oppositeMaxValueX) {
                        overridePosition["right"] = oppositeMaxValueX;
                    }
                    else if (position === "top" &&
                        calculatedPosition["bottom"] > oppositeMaxValueY) {
                        overridePosition["bottom"] = oppositeMaxValueY;
                    }
                    else if (position === "right" &&
                        calculatedPosition["left"] > oppositeMaxValueX) {
                        overridePosition["left"] = oppositeMaxValueX;
                    }
                    else if (position === "bottom" &&
                        calculatedPosition["top"] > oppositeMaxValueY) {
                        overridePosition["top"] = oppositeMaxValueY;
                    }
                }
            }
        }
        return Object.assign(calculatedPosition, overridePosition);
    }
    function resizeCropBox() {
        const newPosition = calculateCropBoxPosition();
        for (let position of Object.keys(newPosition)) {
            cropBoxPosition.current[position] = newPosition[position];
            // Update position values
            animatedCropBoxPosition.current[position].setValue(newPosition[position]);
        }
        // Update offset value
        cropBoxImageOffset.current.setValue({
            x: -cropBoxPosition.current.left / scale.current,
            y: -cropBoxPosition.current.top / scale.current,
        });
    }
    (0, react_1.useImperativeHandle)(ref, () => {
        function getCropData() {
            const { imageWidth: _imageWidth, imageHeight: _imageHeight } = props;
            const ratioX = _imageWidth / imageWidthRef.current;
            const ratioY = _imageHeight / imageHeightRef.current;
            const width = getCropBoxWidth() / scale.current;
            const height = getCropBoxHeight() / scale.current;
            const x = imageWidthRef.current / 2 -
                (width / 2 + imageOffsetX.current) +
                (-cropBoxPosition.current.right + cropBoxPosition.current.left) /
                    scale.current /
                    2;
            const y = imageHeightRef.current / 2 -
                (height / 2 + imageOffsetY.current) +
                (-cropBoxPosition.current.bottom + cropBoxPosition.current.top) /
                    scale.current /
                    2;
            return {
                offset: { x: x * ratioX, y: y * ratioY },
                size: { width: width * ratioX, height: height * ratioY },
                zoomData: {
                    translateX: imageOffsetX.current,
                    translateY: imageOffsetY.current,
                    scale: scale.current,
                    currentZoomDistance: zoomDistance.current,
                },
            };
        }
        return {
            getCropData,
        };
    }, [_imageWidth, _imageHeight]);
    function onWheel(e) {
        const dy = e.deltaY / -1000;
        let newScale = scale.current + dy;
        if (newScale < MIN_SCALE) {
            newScale = MIN_SCALE;
        }
        else if (newScale > maxScale) {
            newScale = maxScale;
        }
        animatedScale.current.setValue(newScale);
        scale.current = newScale;
        translateImage();
        resizeCropBox();
    }
    const animateActiveEdgeStart = (position) => {
        let animatedValue;
        switch (position) {
            case "top": {
                animatedValue = topEdgeActivityIndicatorScale;
                break;
            }
            case "bottom": {
                animatedValue = bottomEdgeActivityIndicatorScale;
                break;
            }
            case "right": {
                animatedValue = rightEdgeActivityIndicatorScale;
                break;
            }
            default:
            case "left": {
                animatedValue = leftEdgeActivityIndicatorScale;
                break;
            }
        }
        react_native_1.Animated.timing(animatedValue.current, {
            toValue: 1,
            useNativeDriver: true,
            duration: 60,
        }).start();
    };
    const animateActiveEdgeEnd = (position) => {
        let animatedValue;
        switch (position) {
            case "top": {
                animatedValue = topEdgeActivityIndicatorScale;
                break;
            }
            case "bottom": {
                animatedValue = bottomEdgeActivityIndicatorScale;
                break;
            }
            case "right": {
                animatedValue = rightEdgeActivityIndicatorScale;
                break;
            }
            default:
            case "left": {
                animatedValue = leftEdgeActivityIndicatorScale;
                break;
            }
        }
        react_native_1.Animated.timing(animatedValue.current, {
            toValue: 0,
            useNativeDriver: true,
            duration: 80,
            easing: react_native_1.Easing.in(react_native_1.Easing.poly(4)),
        }).start();
    };
    const imageContainerStyle = {
        zIndex: -99,
        transform: [
            {
                scale: animatedScale.current,
            },
            {
                translateX: animatedImageOffset.current.x,
            },
            {
                translateY: animatedImageOffset.current.y,
            },
        ],
    };
    const cropBoxStyle = {
        top: animatedCropBoxPosition.current.top,
        bottom: animatedCropBoxPosition.current.bottom,
        right: animatedCropBoxPosition.current.right,
        left: animatedCropBoxPosition.current.left,
        borderWidth: 2,
        borderColor: "#rgba(255, 255, 255, 0.5)",
    };
    const ScrolWheelCaptureWrapper = (props) => {
        return react_native_1.Platform.OS === "web" ? (react_1.default.createElement("div", { onWheel: onWheel }, props.children)) : (react_1.default.createElement(react_1.default.Fragment, null, props.children));
    };
    return (react_1.default.createElement(ScrolWheelCaptureWrapper, null,
        react_1.default.createElement(react_native_1.Animated.View, Object.assign({ style: [
                styles_1.default.container,
                {
                    transform: [
                        {
                            translateX: viewportOffset.current.x,
                        },
                        {
                            translateY: viewportOffset.current.y,
                        },
                    ],
                },
            ] }, imageDragAndPinchResponder.panHandlers),
            (0, util_1.isPointerDevice)() && (react_1.default.createElement(react_native_1.View, { style: styles_1.default.instructionsContainer },
                react_1.default.createElement(react_native_1.Text, { style: styles_1.default.instructionsText }, "Scroll to zoom, drag to move"))),
            react_1.default.createElement(react_native_1.Animated.View, { style: [
                    imageContainerStyle,
                    styles_1.default.overflowImageContainer,
                    { opacity: animatedOverflowImageOpacity.current },
                ] },
                react_1.default.createElement(react_native_1.Image, { style: {
                        width: _imageWidth,
                        height: _imageHeight,
                    }, resizeMode: "contain", source: props.source })),
            react_1.default.createElement(react_native_1.View, { style: [
                    styles_1.default.focusContainer,
                    {
                        width: _imageWidth,
                        height: _imageHeight,
                    },
                ] },
                react_1.default.createElement(react_native_1.Animated.View, { style: [
                        cropBoxStyle,
                        {
                            display: "flex",
                            position: "absolute",
                            overflow: "hidden",
                            borderRadius: props.circular ? 1000 : 0,
                        },
                        props.cropBoxStyle,
                    ] },
                    react_1.default.createElement(react_native_1.Animated.Image, { style: [
                            {
                                transform: [
                                    {
                                        scale: animatedScale.current,
                                    },
                                    {
                                        translateY: react_native_1.Animated.add(cropBoxImageOffset.current.y, animatedImageOffset.current.y),
                                    },
                                    {
                                        translateX: react_native_1.Animated.add(cropBoxImageOffset.current.x, animatedImageOffset.current.x),
                                    },
                                ],
                                position: "absolute",
                                width: _imageWidth,
                                height: _imageHeight,
                            },
                        ], resizeMode: "contain", source: props.source, onLoad: (event) => {
                            // console.log("IMAGE LOADED", event.nativeEvent.source);
                        } })),
                react_1.default.createElement(react_native_1.Animated.View, { style: [
                        styles_1.default.cropBox,
                        cropBoxStyle,
                        { display: props.circular ? "none" : "flex" },
                    ] },
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.topEdgeHandle], pointerEvents: props.fixedRatio ? "none" : "auto" },
                        react_1.default.createElement(react_native_1.Animated.View, { style: [
                                styles_1.default.topEdgeActivityIndicator,
                                {
                                    transform: [
                                        {
                                            scaleY: topEdgeActivityIndicatorScale.current,
                                        },
                                    ],
                                },
                            ] }),
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.topEdgeOuterHandle }, getEdgeCropHandlePanResponder("top").panHandlers))),
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.bottomEdgeHandle], pointerEvents: props.fixedRatio ? "none" : "auto" },
                        react_1.default.createElement(react_native_1.Animated.View, { style: [
                                styles_1.default.bottomEdgeActivityIndicator,
                                {
                                    transform: [
                                        {
                                            scaleY: bottomEdgeActivityIndicatorScale.current,
                                        },
                                    ],
                                },
                            ] }),
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.bottomEdgeOuterHandle }, getEdgeCropHandlePanResponder("bottom").panHandlers))),
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.leftEdgeHandle], pointerEvents: props.fixedRatio ? "none" : "auto" },
                        react_1.default.createElement(react_native_1.Animated.View, { style: [
                                styles_1.default.leftEdgeActivityIndicator,
                                {
                                    transform: [
                                        {
                                            scaleX: leftEdgeActivityIndicatorScale.current,
                                        },
                                    ],
                                },
                            ] }),
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.leftEdgeOuterHandle }, getEdgeCropHandlePanResponder("left").panHandlers))),
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.rightEdgeHandle], pointerEvents: props.fixedRatio ? "none" : "auto" },
                        react_1.default.createElement(react_native_1.Animated.View, { style: [
                                styles_1.default.rightEdgeActivityIndicator,
                                {
                                    transform: [
                                        {
                                            scaleX: rightEdgeActivityIndicatorScale.current,
                                        },
                                    ],
                                },
                            ] }),
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.rightEdgeOuterHandle }, getEdgeCropHandlePanResponder("right").panHandlers))),
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.topLeftCornerHandle] },
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.topLeftCornerOuterHandle }, getCornerCropHandlePanResponder("top-left").panHandlers))),
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.topRightCornerHandle] },
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.topRightCornerOuterHandle }, getCornerCropHandlePanResponder("top-right").panHandlers))),
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.bottomLeftCornerHandle] },
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.bottomLeftCornerOuterHandle }, getCornerCropHandlePanResponder("bottom-left")
                            .panHandlers))),
                    react_1.default.createElement(react_native_1.View, { style: [styles_1.default.bottomRightCornerHandle] },
                        react_1.default.createElement(react_native_1.View, Object.assign({ style: styles_1.default.bottomRightCornerOuterHandle }, getCornerCropHandlePanResponder("bottom-right")
                            .panHandlers))))))));
});
exports.default = ImageCrop;
