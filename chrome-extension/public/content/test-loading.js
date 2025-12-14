// TEST SCRIPT - Remove this file in production
// This adds test functions to the window for easy testing in the browser console

(function (g) {
  const ns = (g.__allerfree ||= {});

  // Test function to show loading with sample restaurants
  g.testRestaurantLoading = function() {
    const sampleRestaurants = [
      {
        name: "McDonalds",
        onClick: () => console.log("McDonalds clicked")
      },
      {
        name: "Burger King",
        onClick: () => console.log("Burger King clicked")
      },
      {
        name: "Momoya SoHo",
        onClick: () => console.log("Momoya SoHo clicked")
      }
    ];

    ns.showRestaurantLoading(sampleRestaurants);
    console.log("✅ Restaurant loading overlay shown!");
    console.log("To hide it, run: hideRestaurantLoading()");
  };

  // Test function to hide loading
  g.hideRestaurantLoading = function() {
    ns.hideRestaurantLoading();
    console.log("✅ Restaurant loading overlay hidden!");
  };

  // Test function to show loading with just spinner (no restaurants)
  g.testLoadingSpinner = function() {
    ns.showRestaurantLoading([]);
    console.log("✅ Loading spinner shown!");
    console.log("To hide it, run: hideRestaurantLoading()");
  };

  // Test queue-based API
  g.testQueue = function() {
    console.log("Adding McDonald's...");
    ns.addRestaurant("McDonald's", "loading");

    setTimeout(() => {
      console.log("Adding Burger King...");
      ns.addRestaurant("Burger King", "loading");
    }, 1000);

    setTimeout(() => {
      console.log("Adding Wendy's...");
      ns.addRestaurant("Wendy's", "loading");
    }, 2000);

    setTimeout(() => {
      console.log("McDonald's complete!");
      ns.updateRestaurantState("McDonald's", "success");
    }, 3000);

    setTimeout(() => {
      console.log("Removing McDonald's...");
      ns.removeRestaurant("McDonald's");
    }, 4500);

    setTimeout(() => {
      console.log("Burger King complete!");
      ns.updateRestaurantState("Burger King", "success");
    }, 5000);

    setTimeout(() => {
      console.log("Adding 4th restaurant (should remove oldest)...");
      ns.addRestaurant("Taco Bell", "loading");
    }, 6000);

    console.log("✅ Queue test started! Watch the bottom-right corner.");
  };

  g.testClearQueue = function() {
    ns.clearAllRestaurants();
    console.log("✅ All restaurants cleared!");
  };

  // Auto-display instructions when script loads
  console.log("%c🧪 AllerFree Test Functions Available:", "font-weight: bold; font-size: 14px; color: #4285f4;");
  console.log("  testRestaurantLoading() - Show loading with sample restaurants");
  console.log("  testLoadingSpinner() - Show loading with just spinner");
  console.log("  testQueue() - Test queue with multiple restaurants (animated)");
  console.log("  testClearQueue() - Clear all restaurants from queue");
  console.log("  hideRestaurantLoading() - Hide the loading overlay");
  console.log("");
  console.log("Example: type 'testQueue()' in the console to see the queue in action");

})(self);
