app.directive('clientTypeSelector', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=',       // Binds to client.Type or filters.type
            getData: '&',     // Calls getType()
            mode: '@',        // 'search' or 'form'
            isEdit: '@'       // 'true' or 'false' (for add/edit)
        },
        template: `
            <select class="form-control" 
                    ng-model="model" 
                    ng-options="type.id as type.name for type in types" 
            </select>
        `,
        link: function (scope) {
            // Load data from getData()
            let rawFn = scope.getData();
            let raw = rawFn();
            console.log(raw);

            if (!Array.isArray(raw)) {
                console.error('getData() did not return an array.');
                scope.types = [];
                return;
            }

            // Copy types
            scope.types = angular.copy(raw);

            // Handle search mode: add "All types"
            if (scope.mode === 'search') {
                scope.types.unshift({ id: null, name: 'All types' });

                // Default to "All types" if model is not set
                if (scope.model === undefined) {
                    scope.model = null;
                }
            }

            // In add mode (not edit), default to null to force user to select
            if (scope.mode === 'form' && scope.isEdit !== 'true') {
                scope.model = null;
            }
        }
    };
});