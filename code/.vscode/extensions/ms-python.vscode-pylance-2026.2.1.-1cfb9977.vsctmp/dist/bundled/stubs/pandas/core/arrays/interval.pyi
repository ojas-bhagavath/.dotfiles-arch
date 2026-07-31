from collections.abc import Sequence
from typing import (
    Any,
    Self,
    TypeAlias,
    overload,
)

from pandas._stubs_only import OrderableT
from pandas.core.arrays.base import ExtensionArray as ExtensionArray
from pandas.core.indexes.base import Index
from pandas.core.series import Series
import pyarrow as pa

from pandas._libs.interval import (
    Interval as Interval,
    IntervalMixin as IntervalMixin,
)
from pandas._typing import (
    AnyArrayLike,
    DtypeArg,
    IntervalClosedType,
    NpDtype,
    Scalar,
    ScalarIndexer,
    SequenceIndexer,
    TakeIndexer,
    np_1darray_bool,
    np_1darray_object,
    np_ndarray,
)

from pandas.core.dtypes.dtypes import IntervalDtype

IntervalOrNA: TypeAlias = Interval | float

class IntervalArray(IntervalMixin, ExtensionArray):
    can_hold_na: bool = True
    def __new__(
        cls,
        data: Sequence[Interval[OrderableT]] | AnyArrayLike,
        closed: IntervalClosedType | None = None,
        dtype: DtypeArg | None = None,
        copy: bool = False,
        verify_integrity: bool = True,
    ) -> Self: ...
    @classmethod
    def from_breaks(
        cls,
        breaks: (
            Sequence[OrderableT]
            | np_ndarray
            | ExtensionArray
            | Index[OrderableT]
            | Series[OrderableT]
        ),
        closed: str = "right",
        copy: bool = False,
        dtype: DtypeArg | None = None,
    ) -> Self:
        """
classmethod(function) -> method

Convert a function to be a class method.

A class method receives the class as implicit first argument,
just like an instance method receives the instance.
To declare a class method, use this idiom:

  class C:
      @classmethod
      def f(cls, arg1, arg2, ...):
          ...

It can be called either on the class (e.g. C.f()) or on an instance
(e.g. C().f()).  The instance is ignored except for its class.
If a class method is called for a derived class, the derived class
object is passed as the implied first argument.

Class methods are different than C++ or Java static methods.
If you want those, see the staticmethod builtin.
        """
        pass
    @classmethod
    def from_arrays(
        cls,
        left: (
            Sequence[OrderableT]
            | np_ndarray
            | ExtensionArray
            | Index[OrderableT]
            | Series[OrderableT]
        ),
        right: (
            Sequence[OrderableT]
            | np_ndarray
            | ExtensionArray
            | Index[OrderableT]
            | Series[OrderableT]
        ),
        closed: IntervalClosedType = "right",
        copy: bool = False,
        dtype: DtypeArg | None = None,
    ) -> Self:
        """
classmethod(function) -> method

Convert a function to be a class method.

A class method receives the class as implicit first argument,
just like an instance method receives the instance.
To declare a class method, use this idiom:

  class C:
      @classmethod
      def f(cls, arg1, arg2, ...):
          ...

It can be called either on the class (e.g. C.f()) or on an instance
(e.g. C().f()).  The instance is ignored except for its class.
If a class method is called for a derived class, the derived class
object is passed as the implied first argument.

Class methods are different than C++ or Java static methods.
If you want those, see the staticmethod builtin.
        """
        pass
    @classmethod
    def from_tuples(
        cls,
        data: Sequence[tuple[OrderableT, OrderableT]] | np_ndarray,
        closed: IntervalClosedType = "right",
        copy: bool = False,
        dtype: DtypeArg | None = None,
    ) -> Self:
        """
classmethod(function) -> method

Convert a function to be a class method.

A class method receives the class as implicit first argument,
just like an instance method receives the instance.
To declare a class method, use this idiom:

  class C:
      @classmethod
      def f(cls, arg1, arg2, ...):
          ...

It can be called either on the class (e.g. C.f()) or on an instance
(e.g. C().f()).  The instance is ignored except for its class.
If a class method is called for a derived class, the derived class
object is passed as the implied first argument.

Class methods are different than C++ or Java static methods.
If you want those, see the staticmethod builtin.
        """
        pass
    def __array__(
        self, dtype: NpDtype | None = None, copy: bool | None = None
    ) -> np_1darray_object: ...
    @overload
    def __getitem__(self, item: ScalarIndexer) -> IntervalOrNA: ...
    @overload
    def __getitem__(self, item: SequenceIndexer) -> Self: ...
    def __eq__(self, other: object) -> np_1darray_bool: ...  # type: ignore[override]  # pyright: ignore[reportIncompatibleMethodOverride]  # pyrefly: ignore[bad-override]  # ty: ignore[invalid-method-override]
    def __ne__(self, other: object) -> np_1darray_bool: ...  # type: ignore[override]  # pyright: ignore[reportIncompatibleMethodOverride]  # pyrefly: ignore[bad-override]  # ty: ignore[invalid-method-override]
    @property
    def dtype(self) -> IntervalDtype: ...
    @property
    def nbytes(self) -> int: ...
    @property
    def size(self) -> int: ...
    def shift(self, periods: int = 1, fill_value: object = ...) -> IntervalArray: ...
    def take(  # type: ignore[override] # pyright: ignore[reportIncompatibleMethodOverride] # pyrefly: ignore[bad-param-name-override] # ty: ignore[invalid-method-override]
        self,
        indices: TakeIndexer,
        *,
        allow_fill: bool = False,
        fill_value: Interval | None = None,
        axis: None = None,  # only for compatibility, does nothing
        **kwargs: Any,
    ) -> Self: ...
    @property
    def left(self) -> Index: ...
    @property
    def right(self) -> Index: ...
    @property
    def closed(self) -> bool: ...
    def set_closed(self, closed: IntervalClosedType) -> Self:
        """
Return an identical IntervalArray closed on the specified side.

Parameters
----------
closed : {'left', 'right', 'both', 'neither'}
    Whether the intervals are closed on the left-side, right-side, both
    or neither.

Returns
-------
IntervalArray

Examples
--------
>>> index = pd.arrays.IntervalArray.from_breaks(range(4))
>>> index
<IntervalArray>
[(0, 1], (1, 2], (2, 3]]
Length: 3, dtype: interval[int64, right]
>>> index.set_closed('both')
<IntervalArray>
[[0, 1], [1, 2], [2, 3]]
Length: 3, dtype: interval[int64, both]
        """
        pass
    @property
    def length(self) -> Index: ...
    @property
    def mid(self) -> Index: ...
    @property
    def is_non_overlapping_monotonic(self) -> bool:
        """
Return a boolean whether the IntervalArray is non-overlapping and monotonic.

Non-overlapping means (no Intervals share points), and monotonic means
either monotonic increasing or monotonic decreasing.

Examples
--------
For arrays:

>>> interv_arr = pd.arrays.IntervalArray([pd.Interval(0, 1), pd.Interval(1, 5)])
>>> interv_arr
<IntervalArray>
[(0, 1], (1, 5]]
Length: 2, dtype: interval[int64, right]
>>> interv_arr.is_non_overlapping_monotonic
True

>>> interv_arr = pd.arrays.IntervalArray([pd.Interval(0, 1),
...                                       pd.Interval(-1, 0.1)])
>>> interv_arr
<IntervalArray>
[(0.0, 1.0], (-1.0, 0.1]]
Length: 2, dtype: interval[float64, right]
>>> interv_arr.is_non_overlapping_monotonic
False

For Interval Index:

>>> interv_idx = pd.interval_range(start=0, end=2)
>>> interv_idx
IntervalIndex([(0, 1], (1, 2]], dtype='interval[int64, right]')
>>> interv_idx.is_non_overlapping_monotonic
True

>>> interv_idx = pd.interval_range(start=0, end=2, closed='both')
>>> interv_idx
IntervalIndex([[0, 1], [1, 2]], dtype='interval[int64, both]')
>>> interv_idx.is_non_overlapping_monotonic
False
        """
        pass
    def __arrow_array__(
        self, type: DtypeArg | None = None
    ) -> pa.ExtensionArray[Any]: ...
    def to_tuples(self, na_tuple: bool = True) -> np_1darray_object:
        """
Return an ndarray (if self is IntervalArray) or Index (if self is IntervalIndex) of tuples of the form (left, right).

Parameters
----------
na_tuple : bool, default True
    If ``True``, return ``NA`` as a tuple ``(nan, nan)``. If ``False``,
    just return ``NA`` as ``nan``.

Returns
-------
tuples: ndarray (if self is IntervalArray) or Index (if self is IntervalIndex)

Examples
--------
For :class:`pandas.IntervalArray`:

>>> idx = pd.arrays.IntervalArray.from_tuples([(0, 1), (1, 2)])
>>> idx
<IntervalArray>
[(0, 1], (1, 2]]
Length: 2, dtype: interval[int64, right]
>>> idx.to_tuples()
array([(0, 1), (1, 2)], dtype=object)

For :class:`pandas.IntervalIndex`:

>>> idx = pd.interval_range(start=0, end=2)
>>> idx
IntervalIndex([(0, 1], (1, 2]], dtype='interval[int64, right]')
>>> idx.to_tuples()
Index([(0, 1), (1, 2)], dtype='object')
        """
        pass
    @overload
    def contains(self, other: Series) -> Series[bool]:
        """
Check elementwise if the Intervals contain the value.

Return a boolean mask whether the value is contained in the Intervals
of the IntervalArray.

Parameters
----------
other : scalar
    The value to check whether it is contained in the Intervals.

Returns
-------
boolean array

See Also
--------
Interval.contains : Check whether Interval object contains value.
IntervalArray.overlaps : Check if an Interval overlaps the values in the
    IntervalArray.

Examples
--------
>>> intervals = pd.arrays.IntervalArray.from_tuples([(0, 1), (1, 3), (2, 4)])
>>> intervals
<IntervalArray>
[(0, 1], (1, 3], (2, 4]]
Length: 3, dtype: interval[int64, right]

>>> intervals.contains(0.5)
array([ True, False, False])
        """
        pass
    @overload
    def contains(
        self, other: Scalar | ExtensionArray | Index | np_ndarray
    ) -> np_1darray_bool: ...
    def overlaps(self, other: Interval) -> np_1darray_bool:
        """
Check elementwise if an Interval overlaps the values in the IntervalArray.

Two intervals overlap if they share a common point, including closed
endpoints. Intervals that only have an open endpoint in common do not
overlap.

Parameters
----------
other : IntervalArray
    Interval to check against for an overlap.

Returns
-------
ndarray
    Boolean array positionally indicating where an overlap occurs.

See Also
--------
Interval.overlaps : Check whether two Interval objects overlap.

Examples
--------
>>> data = [(0, 1), (1, 3), (2, 4)]
>>> intervals = pd.arrays.IntervalArray.from_tuples(data)
>>> intervals
<IntervalArray>
[(0, 1], (1, 3], (2, 4]]
Length: 3, dtype: interval[int64, right]

>>> intervals.overlaps(pd.Interval(0.5, 1.5))
array([ True,  True, False])

Intervals that share closed endpoints overlap:

>>> intervals.overlaps(pd.Interval(1, 3, closed='left'))
array([ True,  True, True])

Intervals that only have an open endpoint in common do not overlap:

>>> intervals.overlaps(pd.Interval(1, 2, closed='right'))
array([False,  True, False])
        """
        pass
    @property
    def is_empty(self) -> np_1darray_bool: ...  # type: ignore[override]  # pyright: ignore[reportIncompatibleMethodOverride]  # pyrefly: ignore[bad-override]
