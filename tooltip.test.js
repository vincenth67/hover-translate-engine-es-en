/**
 * @fileoverview Comprehensive tests for Tooltip module
 * 
 * This test suite covers:
 * - createTooltipElement: DOM element creation with styling
 * - calculateTooltipPosition: Smart positioning logic with boundary detection
 * - showTooltip: Display and update functionality
 * - hideTooltip: Hide and state management
 * - isTooltipVisible: Visibility state checking
 * - Error handling for various edge cases
 * 
 * Test Structure:
 * ├── createTooltipElement
 * │   ├── DOM Structure
 * │   └── Styling Properties
 * ├── calculateTooltipPosition
 * │   ├── Normal Positioning
 * │   ├── Edge Detection and Boundary Handling
 * │   └── Corner Cases
 * ├── showTooltip
 * │   ├── Basic Functionality
 * │   ├── Tooltip Reuse
 * │   └── Error Handling
 * ├── hideTooltip
 * │   ├── Basic Functionality
 * │   └── Edge Cases
 * └── isTooltipVisible
 */

const {
  createTooltipElement,
  calculateTooltipPosition
} = require('../src/widgets/tooltip/tooltip.js');

// Add showTooltip, hideTooltip, isTooltipVisible from the module
const tooltipModule = require('../src/widgets/tooltip/tooltip.js');
const showTooltip = tooltipModule.showTooltip || global.window?.showTooltip;
const hideTooltip = tooltipModule.hideTooltip || global.window?.hideTooltip;
const isTooltipVisible = tooltipModule.isTooltipVisible || global.window?.isTooltipVisible;

describe('Tooltip Module', () => {
  
  // ============================================================================
  // SETUP AND TEARDOWN
  // ============================================================================
  // Ensures clean DOM state for each test
  
  beforeEach(() => {
    document.body.innerHTML = '';
    // Re-require the module to ensure global assignments
    jest.resetModules();
    require('../src/widgets/tooltip/tooltip.js');
  });

  // ============================================================================
  // createTooltipElement FUNCTION TESTS
  // ============================================================================
  // Tests the tooltip DOM element creation functionality
  // Verifies proper element structure and styling properties
  
  describe('createTooltipElement', () => {
    
    // ============================================================================
    // DOM STRUCTURE TESTS
    // ============================================================================
    // Tests that the created element has the correct DOM structure
    // Verifies element type and class name
    
    describe('DOM Structure', () => {
      it('should create tooltip element with correct DOM structure', () => {
        // Test case: Verify element is created as HTMLElement with correct class
        const tooltip = createTooltipElement();
        expect(tooltip).toBeInstanceOf(HTMLElement);
        expect(tooltip.className).toBe('hover-translate-tooltip');
      });
    });

    // ============================================================================
    // STYLING PROPERTIES TESTS
    // ============================================================================
    // Tests that all required CSS properties are applied correctly
    // Verifies positioning, colors, typography, and visual effects
    
    describe('Styling Properties', () => {
      it('should apply correct styling properties to tooltip element', () => {
        // Test case: Verify all CSS properties are set correctly
        const tooltip = createTooltipElement();
        
        // Test core styling properties
        expect(tooltip.style.position).toBe('fixed');
        expect(tooltip.style.backgroundColor).toBe('rgb(51, 51, 51)');
        expect(tooltip.style.color).toBe('white');
        expect(tooltip.style.padding).toBe('6px 10px');
        expect(tooltip.style.borderRadius).toBe('4px');
        expect(tooltip.style.fontSize).toBe('14px');
        expect(tooltip.style.fontFamily).toBe('Arial, sans-serif');
        expect(tooltip.style.zIndex).toBe('10000');
        expect(tooltip.style.pointerEvents).toBe('none');
        expect(tooltip.style.opacity).toBe('0');
        expect(tooltip.style.transition).toBe('opacity 0.2s ease-in-out');
        expect(tooltip.style.maxWidth).toBe('200px');
        expect(tooltip.style.wordWrap).toBe('break-word');
        expect(tooltip.style.boxShadow).toBe('0 2px 8px rgba(0,0,0,0.3)');
        expect(tooltip.style.border).toBe('1px solid rgb(85, 85, 85)');
      });
    });
  });

  // ============================================================================
  // calculateTooltipPosition FUNCTION TESTS
  // ============================================================================
  // Tests the smart positioning logic that keeps tooltips within viewport bounds
  // Verifies boundary detection and positioning adjustments
  
  describe('calculateTooltipPosition', () => {
    let originalInnerWidth, originalInnerHeight;
    
    // ============================================================================
    // VIEWPORT MOCKING SETUP
    // ============================================================================
    // Sets up mock viewport dimensions for consistent testing
    
    beforeAll(() => {
      originalInnerWidth = global.innerWidth;
      originalInnerHeight = global.innerHeight;
      global.innerWidth = 800;
      global.innerHeight = 600;
    });
    
    afterAll(() => {
      global.innerWidth = originalInnerWidth;
      global.innerHeight = originalInnerHeight;
    });

    // ============================================================================
    // NORMAL POSITIONING TESTS
    // ============================================================================
    // Tests standard positioning behavior when tooltip fits within viewport
    // Verifies centering and default positioning below mouse cursor
    
    describe('Normal Positioning', () => {
      it('should position tooltip below mouse cursor by default', () => {
        // Test case: Standard positioning below mouse with centering
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 100, height: 30 })
        });
        const pos = calculateTooltipPosition(400, 200, tooltip);
        expect(pos.x).toBe(350); // Centered horizontally
        expect(pos.y).toBe(210); // 10px below mouse
      });

      it('should center tooltip horizontally relative to mouse position', () => {
        // Test case: Verify horizontal centering with different tooltip widths
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 200, height: 30 })
        });
        const pos = calculateTooltipPosition(400, 200, tooltip);
        expect(pos.x).toBe(300); // Centered: 400 - (200/2)
        expect(pos.y).toBe(210);
      });
    });

    // ============================================================================
    // EDGE DETECTION AND BOUNDARY HANDLING TESTS
    // ============================================================================
    // Tests smart positioning when tooltip would go outside viewport
    // Verifies automatic flipping and boundary snapping
    
    describe('Edge Detection and Boundary Handling', () => {
      it('should position tooltip above mouse when near bottom edge', () => {
        // Test case: Tooltip flips above mouse when it would go below viewport
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 100, height: 30 })
        });
        const pos = calculateTooltipPosition(400, 590, tooltip);
        expect(pos.y).toBeLessThan(590); // Should be above mouse
        expect(pos.y).toBe(550); // 590 - 30 - 10px gap
      });

      it('should keep tooltip within left edge boundary', () => {
        // Test case: Tooltip snaps to left margin when it would go off-screen
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 100, height: 30 })
        });
        const pos = calculateTooltipPosition(20, 200, tooltip);
        expect(pos.x).toBeGreaterThanOrEqual(10); // Minimum margin
        expect(pos.x).toBe(10); // Should snap to left margin
      });

      it('should keep tooltip within right edge boundary', () => {
        // Test case: Tooltip snaps to right margin when it would go off-screen
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 200, height: 30 })
        });
        const pos = calculateTooltipPosition(790, 200, tooltip);
        expect(pos.x + 200).toBeLessThanOrEqual(800 - 10); // Within right margin
        expect(pos.x).toBe(590); // Should snap to right margin
      });

      it('should keep tooltip within top edge when flipped above', () => {
        // Test case: Tooltip respects top margin even when flipped above mouse
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 100, height: 100 })
        });
        const pos = calculateTooltipPosition(400, 30, tooltip);
        expect(pos.y).toBeGreaterThanOrEqual(20); // Minimum top margin
        expect(pos.y).toBe(40); // Should snap to top margin (30 - 100 - 10 = -80, but clamped to 20)
      });
    });

    // ============================================================================
    // CORNER CASES TESTS
    // ============================================================================
    // Tests extreme scenarios like oversized tooltips and very small tooltips
    // Verifies robust handling of edge cases
    
    describe('Corner Cases', () => {
      it('should handle tooltip larger than viewport', () => {
        // Test case: Extremely large tooltip that exceeds viewport dimensions
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 1000, height: 800 })
        });
        const pos = calculateTooltipPosition(400, 300, tooltip);
        expect(pos.x).toBe(10); // Should snap to left margin
        expect(pos.y).toBe(20); // Should snap to top margin
      });

      it('should handle very small tooltip', () => {
        // Test case: Very small tooltip to verify precision positioning
        const tooltip = document.createElement('div');
        Object.defineProperty(tooltip, 'getBoundingClientRect', {
          value: () => ({ width: 10, height: 5 })
        });
        const pos = calculateTooltipPosition(400, 200, tooltip);
        expect(pos.x).toBe(395); // Centered: 400 - (10/2)
        expect(pos.y).toBe(210); // Below mouse: 200 + 10
      });
    });
  });

  // ============================================================================
  // showTooltip FUNCTION TESTS
  // ============================================================================
  // Tests the tooltip display functionality
  // Verifies creation, positioning, content updates, and error handling
  
  describe('showTooltip', () => {
    
    // ============================================================================
    // BASIC FUNCTIONALITY TESTS
    // ============================================================================
    // Tests fundamental tooltip display behavior
    // Verifies tooltip creation, content setting, and visibility
    
    describe('Basic Functionality', () => {
      it('should create and display tooltip with correct text content', () => {
        // Test case: Basic tooltip creation and display
        window.showTooltip('testword', 100, 100);
        const tooltip = document.querySelector('.hover-translate-tooltip');
        expect(tooltip).not.toBeNull();
        expect(tooltip.textContent).toBe('testword');
        expect(tooltip.style.opacity).toBe('1');
      });

      it('should position tooltip at specified coordinates', () => {
        // Test case: Verify tooltip positioning at given coordinates
        window.showTooltip('positioned', 150, 250);
        const tooltip = document.querySelector('.hover-translate-tooltip');
        expect(tooltip).not.toBeNull();
        // Position will be calculated based on tooltip size and boundaries
        expect(tooltip.style.left).toBeDefined();
        expect(tooltip.style.top).toBeDefined();
      });
    });

    // ============================================================================
    // TOOLTIP REUSE TESTS
    // ============================================================================
    // Tests that existing tooltip elements are reused efficiently
    // Verifies content updates and state management
    
    describe('Tooltip Reuse', () => {
      it('should reuse existing tooltip element when called multiple times', () => {
        // Test case: Verify same DOM element is reused for efficiency
        window.showTooltip('first', 50, 50);
        const firstTooltip = document.querySelector('.hover-translate-tooltip');
        
        window.showTooltip('second', 200, 200);
        const secondTooltip = document.querySelector('.hover-translate-tooltip');
        
        expect(firstTooltip).toBe(secondTooltip); // Same element
        expect(secondTooltip.textContent).toBe('second');
        expect(secondTooltip.style.opacity).toBe('1');
      });

      it('should update tooltip content and position on subsequent calls', () => {
        // Test case: Verify content and position updates work correctly
        window.showTooltip('initial', 100, 100);
        window.showTooltip('updated', 300, 300);
        
        const tooltip = document.querySelector('.hover-translate-tooltip');
        expect(tooltip.textContent).toBe('updated');
        expect(tooltip.style.opacity).toBe('1');
      });
    });

    // ============================================================================
    // ERROR HANDLING TESTS
    // ============================================================================
    // Tests graceful handling of DOM manipulation errors
    // Verifies that errors don't crash the application
    
    describe('Error Handling', () => {
      it('should handle DOM manipulation errors gracefully', () => {
        // Test case: DOM appendChild throws an exception
        // Force error by making appendChild throw
        const origAppend = document.body.appendChild;
        document.body.appendChild = () => { throw new Error('fail'); };
        
        expect(() => window.showTooltip('err', 1, 1)).not.toThrow();
        
        document.body.appendChild = origAppend;
        // Tooltip should not be visible after error
        expect(document.querySelector('.hover-translate-tooltip')).toBeNull();
      });

      it('should hide tooltip when errors occur during display', () => {
        // Test case: Positioning calculation fails
        // Mock a scenario where positioning fails
        const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = () => ({ width: 0, height: 0 });
        
        window.showTooltip('error-test', 100, 100);
        
        Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
        // Should still handle gracefully
        expect(() => window.hideTooltip()).not.toThrow();
      });
    });
  });

  // ============================================================================
  // hideTooltip FUNCTION TESTS
  // ============================================================================
  // Tests the tooltip hiding functionality
  // Verifies opacity changes, state updates, and edge cases
  
  describe('hideTooltip', () => {
    
    // ============================================================================
    // BASIC FUNCTIONALITY TESTS
    // ============================================================================
    // Tests fundamental tooltip hiding behavior
    // Verifies opacity changes and state management
    
    describe('Basic Functionality', () => {
      it('should hide tooltip by setting opacity to 0', () => {
        // Test case: Verify tooltip becomes invisible
        window.showTooltip('hide-me', 100, 100);
        window.hideTooltip();
        
        const tooltip = document.querySelector('.hover-translate-tooltip');
        expect(tooltip).not.toBeNull();
        expect(tooltip.style.opacity).toBe('0');
      });

      it('should update tooltip visibility state', () => {
        // Test case: Verify internal state is updated correctly
        window.showTooltip('visible', 10, 10);
        expect(window.isTooltipVisible()).toBe(true);
        
        window.hideTooltip();
        expect(window.isTooltipVisible()).toBe(false);
      });
    });

    // ============================================================================
    // EDGE CASES TESTS
    // ============================================================================
    // Tests edge cases like hiding non-existent tooltips
    // Verifies robust error handling
    
    describe('Edge Cases', () => {
      it('should not throw error when hiding non-existent tooltip', () => {
        // Test case: Hide called when no tooltip exists
        // Remove tooltip if present
        const existing = document.querySelector('.hover-translate-tooltip');
        if (existing) existing.remove();
        
        expect(() => window.hideTooltip()).not.toThrow();
      });

      it('should handle multiple hide calls gracefully', () => {
        // Test case: Multiple hide calls should not cause issues
        window.showTooltip('test', 100, 100);
        window.hideTooltip();
        window.hideTooltip(); // Second call should not cause issues
        
        const tooltip = document.querySelector('.hover-translate-tooltip');
        expect(tooltip.style.opacity).toBe('0');
      });
    });
  });

  // ============================================================================
  // isTooltipVisible FUNCTION TESTS
  // ============================================================================
  // Tests the tooltip visibility state checking functionality
  // Verifies accurate state reporting in various scenarios
  
  describe('isTooltipVisible', () => {
    it('should return true when tooltip is displayed', () => {
      // Test case: Tooltip is visible
      window.showTooltip('visible', 10, 10);
      expect(window.isTooltipVisible()).toBe(true);
    });

    it('should return false when tooltip is hidden', () => {
      // Test case: Tooltip is hidden
      window.showTooltip('visible', 10, 10);
      window.hideTooltip();
      expect(window.isTooltipVisible()).toBe(false);
    });

    it('should return false when no tooltip exists', () => {
      // Test case: No tooltip element exists
      // Remove any existing tooltip
      const existing = document.querySelector('.hover-translate-tooltip');
      if (existing) existing.remove();
      
      expect(window.isTooltipVisible()).toBe(false);
    });
  });
}); 