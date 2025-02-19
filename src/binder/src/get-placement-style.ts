import { Placement, NonCenterPlacement, Rect, Align, Position, TransformOrigin } from './interface'

const oppositionPositions: Record<Position, Position> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
}

const oppositeAligns: Record<Align, Align> = {
  start: 'end',
  center: 'center',
  end: 'start'
}

const propToCompare: Record<Position, 'width' | 'height'> = {
  top: 'height',
  bottom: 'height',
  left: 'width',
  right: 'width'
}

const transformOrigins: Record<Placement, TransformOrigin> = {
  'bottom-start': 'top left',
  bottom: 'top center',
  'bottom-end': 'top right',
  'top-start': 'bottom left',
  top: 'bottom center',
  'top-end': 'bottom right',
  'right-start': 'top left',
  right: 'center left',
  'right-end': 'bottom left',
  'left-start': 'top right',
  left: 'center right',
  'left-end': 'bottom right'
}

const overlapTransformOrigin: Record<Placement, TransformOrigin> = {
  'bottom-start': 'bottom left',
  bottom: 'bottom center',
  'bottom-end': 'bottom right',
  'top-start': 'top left',
  top: 'top center',
  'top-end': 'top right',
  'right-start': 'top right',
  right: 'center right',
  'right-end': 'bottom right',
  'left-start': 'top left',
  left: 'center left',
  'left-end': 'bottom left'
}

const oppositeAlignCssPositionProps: Record<NonCenterPlacement, Position> = {
  'bottom-start': 'right',
  'bottom-end': 'left',
  'top-start': 'right',
  'top-end': 'left',
  'right-start': 'bottom',
  'right-end': 'top',
  'left-start': 'bottom',
  'left-end': 'top'
}

export function getProperPlacementOfFollower (
  placement: Placement,
  targetRect: Rect,
  followerRect: Rect,
  flip: boolean,
  overlap: boolean
): Placement {
  if (!flip || overlap) {
    return placement
  }
  const [position, align] = placement.split('-') as [Position, Align]
  let properAlign = align ?? 'center'
  if (align !== 'center') {
    const oppositeAlignCssPositionProp = oppositeAlignCssPositionProps[placement as NonCenterPlacement]
    const currentAlignCssPositionProp = oppositionPositions[oppositeAlignCssPositionProp]
    const oppositeAlignCssSizeProp = propToCompare[oppositeAlignCssPositionProp]
    // if follower rect is larger than target rect in align direction
    //           [ target ]
    //           [     follower     ]
    // [     follower     ] <---->
    if (followerRect[oppositeAlignCssSizeProp] > targetRect[oppositeAlignCssSizeProp]) {
      // [ target ]---|
      // [ follower   |  ]
      if (
        // overflow screen
        (targetRect[oppositeAlignCssPositionProp] + targetRect[oppositeAlignCssSizeProp] <= followerRect[oppositeAlignCssSizeProp]) &&
        // opposite align has larger space
        (targetRect[oppositeAlignCssPositionProp] < targetRect[currentAlignCssPositionProp])
      ) {
        properAlign = oppositeAligns[align]
      }
    }
    // if follower rect is smaller than target rect in align direction
    // [     target     ]
    // [ follower ]         <---->
    if (followerRect[oppositeAlignCssSizeProp] < targetRect[oppositeAlignCssSizeProp]) {
      if (
        targetRect[currentAlignCssPositionProp] < 0 &&
        // opposite align has larger space
        targetRect[oppositeAlignCssPositionProp] > targetRect[currentAlignCssPositionProp]
      ) {
        properAlign = oppositeAligns[align]
      }
    }
  }
  let properPosition = position
  if (
    // space is not enough
    !(targetRect[position] >= followerRect[propToCompare[position]]) &&
    // opposite position's space is larger
    targetRect[oppositionPositions[position]] >= followerRect[propToCompare[position]]
  ) {
    properPosition = oppositionPositions[position]
  }
  return properAlign !== 'center' ? `${properPosition}-${properAlign}` as Placement : properPosition
}

export function getProperTransformOrigin (placement: Placement, overlap: boolean): TransformOrigin {
  if (overlap) return overlapTransformOrigin[placement]
  return transformOrigins[placement]
}

interface PlacementOffset {
  top: string
  left: string
  transform: string
}

// ------------
// |  offset  |
// |          |
// | [target] |
// |          |
// ------------
export function getOffset (
  placement: Placement,
  offsetRect: Rect,
  targetRect: Rect,
  overlap: boolean
): PlacementOffset {
  if (overlap) {
    switch (placement) {
      case 'bottom-start':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left)}px`,
          transform: 'translateY(-100%)'
        }
      case 'bottom-end':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
          transform: 'translateX(-100%) translateY(-100%)'
        }
      case 'top-start':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left)}px`,
          transform: ''
        }
      case 'top-end':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
          transform: 'translateX(-100%)'
        }
      case 'right-start':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
          transform: 'translateX(-100%)'
        }
      case 'right-end':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
          transform: 'translateX(-100%) translateY(-100%)'
        }
      case 'left-start':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left)}px`,
          transform: ''
        }
      case 'left-end':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left)}px`,
          transform: 'translateY(-100%)'
        }
      case 'top':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width / 2)}px`,
          transform: 'translateX(-50%)'
        }
      case 'right':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height / 2)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
          transform: 'translateX(-100%) translateY(-50%)'
        }
      case 'left':
        return {
          top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height / 2)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left)}px`,
          transform: 'translateY(-50%)'
        }
      case 'bottom':
      default:
        return {
          top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
          left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width / 2)}px`,
          transform: 'translateX(-50%) translateY(-100%)'
        }
    }
  }

  switch (placement) {
    case 'bottom-start':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left)}px`,
        transform: ''
      }
    case 'bottom-end':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
        transform: 'translateX(-100%)'
      }
    case 'top-start':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left)}px`,
        transform: 'translateY(-100%)'
      }
    case 'top-end':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
        transform: 'translateX(-100%) translateY(-100%)'
      }
    case 'right-start':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
        transform: ''
      }
    case 'right-end':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
        transform: 'translateY(-100%)'
      }
    case 'left-start':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left)}px`,
        transform: 'translateX(-100%)'
      }
    case 'left-end':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left)}px`,
        transform: 'translateX(-100%) translateY(-100%)'
      }
    case 'top':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width / 2)}px`,
        transform: 'translateY(-100%) translateX(-50%)'
      }
    case 'right':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height / 2)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width)}px`,
        transform: 'translateY(-50%)'
      }
    case 'left':
      return {
        top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height / 2)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left)}px`,
        transform: 'translateY(-50%) translateX(-100%)'
      }
    case 'bottom':
    default:
      return {
        top: `${Math.round(targetRect.top - offsetRect.top + targetRect.height)}px`,
        left: `${Math.round(targetRect.left - offsetRect.left + targetRect.width / 2)}px`,
        transform: 'translateX(-50%)'
      }
  }
}
